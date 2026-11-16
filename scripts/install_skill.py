#!/usr/bin/env python3
"""Install the entire local Skill folder without downloading or overwriting anything."""
import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "skills/big-game-page"


def install(parent):
    parent = parent.expanduser().resolve()
    if parent == SOURCE or SOURCE in parent.parents:
        raise ValueError("Destination must be outside the source Skill folder")
    target = parent / SOURCE.name
    if target.exists() or target.is_symlink():
        raise FileExistsError(f"Already exists, left untouched: {target}")
    subprocess.run([sys.executable, str(SOURCE / "scripts/validate_package.py")], check=True)
    parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".bgp-install-", dir=parent) as staging:
        copy = Path(staging) / SOURCE.name
        shutil.copytree(SOURCE, copy, ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))
        subprocess.run([sys.executable, str(copy / "scripts/validate_package.py")], check=True)
        copy.rename(target)
    return target


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dest", required=True, type=Path, help="Parent directory, e.g. ~/.agents/skills")
    args = parser.parse_args()
    try:
        result = install(args.dest)
    except (ValueError, FileExistsError, subprocess.CalledProcessError) as exc:
        parser.exit(1, str(exc) + "\n")
    print(f"Installed: {result}\nInvoke $big-game-page in Codex. Restart if it is not detected.")
