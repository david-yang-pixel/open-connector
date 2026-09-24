#!/usr/bin/env bash
set -euo pipefail

umask 077
read -r public_key
if [[ ! $public_key =~ ^ssh-ed25519\ [A-Za-z0-9+/=]+\ openconnector-github-actions-[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo 'Expected a dedicated OpenConnector deployment public key' >&2
  exit 2
fi

install -d -m 700 /root/.ssh
authorized_keys=/root/.ssh/authorized_keys
touch "$authorized_keys"
chmod 600 "$authorized_keys"

line="restrict,command=\"/usr/local/sbin/openconnector-deploy-receiver\" $public_key"
if grep -Fqx "$line" "$authorized_keys"; then
  echo 'Deployment key is already installed'
  exit 0
fi

printf '%s\n' "$line" >> "$authorized_keys"
echo 'Installed a forced-command-only deployment key'
