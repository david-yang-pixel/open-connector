#!/usr/bin/env bash
set -euo pipefail

umask 077
export PATH=/usr/sbin:/usr/bin:/sbin:/bin

if [[ ! ${SSH_ORIGINAL_COMMAND:-} =~ ^deploy\ ([0-9a-f]{40})$ ]]; then
  echo 'Invalid deployment command' >&2
  exit 2
fi

sha=${BASH_REMATCH[1]}
image="openconnector:cicd-$sha"
container=openconnector
volume=openconnector-staging-v3-data
env_file=/etc/openconnector/runtime.env
backup_dir=/var/backups/openconnector
rollback_container=
deployed=false
old_container_stopped=false

if [[ ! -f $env_file ]] || [[ $(stat -c '%a' "$env_file") != 600 ]]; then
  echo 'Runtime environment file is missing or has unsafe permissions' >&2
  exit 2
fi

exec 9>/var/lock/openconnector-deploy.lock
if ! flock -w 30 9; then
  echo 'Another deployment is already running' >&2
  exit 1
fi

rollback() {
  local status=$?
  if [[ $status -eq 0 || $deployed == true ]]; then
    return
  fi

  if [[ -n $rollback_container ]] && docker inspect "$rollback_container" >/dev/null 2>&1; then
    echo 'Deployment failed; restoring the previous container' >&2
    docker rm -f "$container" >/dev/null 2>&1 || true
    docker rename "$rollback_container" "$container" >/dev/null
    docker start "$container" >/dev/null
    docker image rm "$image" >/dev/null 2>&1 || true
  elif [[ $old_container_stopped == true ]]; then
    echo 'Deployment failed before replacement; restarting the previous container' >&2
    docker start "$container" >/dev/null
  fi
}
trap rollback EXIT

# Loading an image does not touch the running service. The forced SSH key only
# permits this command and does not expose a general shell on the server.
docker load --quiet >/dev/null
docker image inspect "$image" >/dev/null
docker volume inspect "$volume" >/dev/null

if ! docker container inspect "$container" >/dev/null 2>&1; then
  echo 'The existing OpenConnector container is missing' >&2
  exit 1
fi

mkdir -p "$backup_dir"
chmod 700 "$backup_dir"
volume_path=$(docker volume inspect "$volume" --format '{{.Mountpoint}}')
database_path="$volume_path/connect.sqlite"
backup_path="$backup_dir/$(date -u +%Y%m%dT%H%M%SZ)-${sha:0:12}.sqlite"

# sqlite3.backup makes a consistent snapshot while the old container is live.
python3 - "$database_path" "$backup_path" <<'PY'
import os
import sqlite3
import sys

source_path, target_path = sys.argv[1:]
source = sqlite3.connect(f"file:{source_path}?mode=ro", uri=True, timeout=30)
target = sqlite3.connect(target_path)
try:
    source.backup(target)
finally:
    target.close()
    source.close()
os.chmod(target_path, 0o600)
PY

rollback_name="openconnector-rollback-$(date -u +%Y%m%dT%H%M%SZ)-${sha:0:8}"
docker stop --time 30 "$container" >/dev/null
old_container_stopped=true
docker rename "$container" "$rollback_name"
rollback_container=$rollback_name

docker run --detach --pull=never --name "$container" \
  --restart unless-stopped \
  --env-file "$env_file" \
  --mount "type=volume,source=$volume,target=/app/data" \
  --publish 127.0.0.1:3301:3000 \
  --label "com.openconnector.git-sha=$sha" \
  "$image" >/dev/null

for attempt in {1..45}; do
  health=$(docker inspect "$container" --format '{{.State.Health.Status}}' 2>/dev/null || true)
  if [[ $health == healthy ]] &&
    curl --fail --silent --show-error --max-time 3 http://127.0.0.1:3301/health | grep -q '"ok":true'; then
    deployed=true
    docker rm "$rollback_container" >/dev/null
    rollback_container=

    # The manually retired staging container has no separate data: it used
    # the same named volume. Remove it so its image can also be discarded.
    if docker container inspect openconnector-staging-v3 >/dev/null 2>&1; then
      if [[ $(docker inspect openconnector-staging-v3 --format '{{.State.Running}}') == false ]]; then
        docker rm openconnector-staging-v3 >/dev/null
      fi
    fi

    while IFS= read -r old_image; do
      [[ $old_image == "$image" ]] && continue
      docker image rm "$old_image" >/dev/null
    done < <(docker image ls openconnector --format '{{.Repository}}:{{.Tag}}')

    echo "Deployed OpenConnector $sha"
    exit 0
  fi
  sleep 2
done

echo 'The new container did not become healthy in time' >&2
exit 1
