#!/usr/bin/env python3
"""Build all four standalone demos and their catalog. Python 3.9+, stdlib only."""
import argparse
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "skills/big-game-page"
RECIPES = ("switchyard-zero", "night-harbor", "selene-repair", "bunker-09")


def build_all(out):
    spec = importlib.util.spec_from_file_location("bgp_builder", SKILL / "scripts/build.py")
    builder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(builder)
    catalog = []
    for name in RECIPES:
        recipe = SKILL / f"assets/recipes/{name}.json"
        info = builder.build(recipe, Path(out) / f"{name}.html")
        info["file"] = f"{name}.html"
        info["title"] = json.loads(recipe.read_text(encoding="utf-8"))["title"]
        catalog.append(info)
    return catalog


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=ROOT / "site/games")
    args = parser.parse_args()
    catalog = build_all(args.out)
    # This catalog is metadata; it does not alter the exported game bytes.
    target = args.out / "catalog.json"
    target.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for game in catalog:
        print(f'{game["id"]}: {game["bytes"]:,} B  {game["sha256"]}')


if __name__ == "__main__":
    main()
