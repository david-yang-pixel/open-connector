"""Persist the current container's OpenConnector settings for future deployments.

Run once as root on the server. This does not print credential values. The
resulting file must stay outside the repository and readable only by root.
"""

import json
import os
import subprocess
from pathlib import Path


def main() -> None:
    destination = Path("/etc/openconnector/runtime.env")
    if destination.exists():
        raise SystemExit("Runtime environment already exists; refusing to overwrite it")

    inspect = subprocess.run(
        ["docker", "inspect", "openconnector"],
        check=True,
        capture_output=True,
        text=True,
    )
    config = json.loads(inspect.stdout)[0]["Config"]["Env"]
    values = {}
    for entry in config:
        key, _, value = entry.partition("=")
        if key.startswith("OOMOL_CONNECT_"):
            if "\n" in value or "\r" in value:
                raise SystemExit(f"Unsupported multiline value for {key}")
            values[key] = value

    for required in ("OOMOL_CONNECT_ADMIN_TOKEN", "OOMOL_CONNECT_ENCRYPTION_KEY"):
        if not values.get(required):
            raise SystemExit(f"Missing {required} on the current container")

    destination.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    temp = destination.with_suffix(".tmp")
    fd = os.open(temp, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as output:
            for key, value in sorted(values.items()):
                output.write(f"{key}={value}\n")
        os.replace(temp, destination)
    except BaseException:
        temp.unlink(missing_ok=True)
        raise
    print(f"Saved {len(values)} OpenConnector settings to {destination} (values hidden)")


if __name__ == "__main__":
    main()
