# Tencent Cloud deployment

This private fork deploys `main` to `openconnector.smlershou.top` after its `CI`
workflow succeeds. GitHub Actions builds `docker/Dockerfile` on a GitHub runner,
streams the image over SSH, and checks the server's health endpoint. The server
does not build the image or need access to the GitHub repository or a registry.
The workflow can also be started manually from GitHub Actions, but only for the
current `main` commit after a successful push CI run. Star History-only updates
do not redeploy the service.

After the public health check passes, a separate `tag` job tags the deployed
commit as `deploy-YYYYMMDD-HHMM` in Beijing time (Asia/Shanghai), for example
`deploy-20261018-1804`, so the code of every deployment can be found by date.
Only that job gets `contents: write`; the job that builds and ships the image
keeps a read-only token. Skipped and failed deployments are not tagged. List
the deployments with `git fetch --tags && git tag -l 'deploy-*'`.

The deployment SSH key is restricted by `authorized_keys` to the installed
`/usr/local/sbin/openconnector-deploy-receiver` command. It cannot open a shell,
forward ports, or request a PTY. Store its private half only in the repository
secret `TENCENT_DEPLOY_SSH_KEY`; set `TENCENT_DEPLOY_HOST` as a repository variable.
`deploy/tencent-authorize-key.sh` installs the public half without replacing
the server's existing SSH keys.
The workflow pins the server's Ed25519 host-key fingerprint. Rotate that pin
when the server host key changes, after verifying the new key out of band.

The server keeps its existing `openconnector-staging-v3-data` Docker volume and
the same OpenConnector settings. `/etc/openconnector/runtime.env` is a root-only
file generated once from the previous container by
`deploy/tencent-bootstrap-env.py`; it must never be committed or printed. The
receiver script must be installed as a root-owned executable outside the
repository. Update that installed copy deliberately when the script changes.

For each deployment, the receiver makes a consistent SQLite backup under
`/var/backups/openconnector`, stops the old container, starts the new image, and
waits for Docker and HTTP health. On failure it restores the old container. On
success it removes the old container and old `openconnector` image tags; only
the current image is retained. Database backups are not images and are not
automatically deleted. A schema migration that is not backward-compatible may
need a manual database restore; the automatic container rollback does not
overwrite live data.

Check the running revision with:

```sh
docker inspect openconnector --format '{{index .Config.Labels "com.openconnector.git-sha"}}'
```

Inspect the backup directory and the current volume before any manual restore.
Do not restore a snapshot while OpenConnector is writing to the volume.
