#!/usr/bin/env python3
"""Check reproducibility, installed Skill, links, source records and release status."""
import argparse
import hashlib
import importlib.util
import json
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from build import build_all, SKILL
from install_skill import install


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ("href", "src") and value:
                self.links.append(value)


def check_links():
    count = 0
    files = list(ROOT.rglob("*.md")) + list((ROOT / "site").glob("*.html"))
    for path in files:
        if ".git" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        if path.suffix == ".md":
            links = re.findall(r'\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)', text)
        else:
            parser = Links(); parser.feed(text); links = parser.links
        for value in links:
            url = urlsplit(value)
            if url.scheme or url.netloc or not url.path:
                continue
            target = path.parent / unquote(url.path)
            assert target.exists(), f"Broken link in {path.relative_to(ROOT)}: {value}"
            count += 1
    return count


def check():
    subprocess.run([sys.executable, str(SKILL / "scripts/validate_package.py")], check=True)
    existing = ROOT / "site/games"
    assert existing.is_dir(), "Run python3 scripts/build.py first"
    node = shutil.which("node")
    if node:
        subprocess.run([node, "--check", str(ROOT / "site/site.js")], check=True, capture_output=True)
        subprocess.run([node, str(ROOT / "scripts/check_locales.mjs")], check=True)
    with tempfile.TemporaryDirectory(prefix="bgp-check-") as folder:
        temp = Path(folder)
        first, second = build_all(temp / "first"), build_all(temp / "second")
        assert first == second, "Nondeterministic build manifests"
        for game in first:
            a = (temp / "first" / game["file"]).read_bytes()
            assert a == (temp / "second" / game["file"]).read_bytes()
            assert a == (existing / game["file"]).read_bytes(), "Stale demo: " + game["file"]
            if node:
                script = re.search(rb"<script>\s*(.*?)</script>", a, re.S).group(1)
                js = temp / (game["id"] + ".js"); js.write_bytes(script)
                subprocess.run([node, "--check", str(js)], check=True, capture_output=True)
        installed = install(temp / "skills")
        subprocess.run([sys.executable, str(installed / "scripts/build.py"),
                        "--recipe", str(installed / "assets/recipes/switchyard-zero.json"),
                        "--out", str(temp / "installed.html")], check=True, capture_output=True)
        assert (temp / "installed.html").read_bytes() == (existing / "switchyard-zero.html").read_bytes()
        try:
            install(temp / "skills")
        except FileExistsError:
            pass
        else:
            raise AssertionError("Installer must reject an existing destination")
        assert (installed / "SKILL.md").read_bytes() == (SKILL / "SKILL.md").read_bytes()
        spec = importlib.util.spec_from_file_location("isolated_builder", installed / "scripts/build.py")
        module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
        foundation = installed / "assets/runtime/foundation.js"
        foundation.write_bytes(foundation.read_bytes() + b"\n")
        try:
            module.build(installed / "assets/recipes/switchyard-zero.json", temp / "bad.html")
        except ValueError as exc:
            assert "Pinned foundation changed" in str(exc)
        else:
            raise AssertionError("Modified foundation was accepted")
    count = check_links()
    for path in ROOT.rglob("*.json"):
        if ".git" not in path.parts:
            json.loads(path.read_text(encoding="utf-8"))
    source = json.loads((ROOT / "docs/provenance/source-record.json").read_text(encoding="utf-8"))
    assert source["foundationSHA256"] == hashlib.sha256((SKILL / "assets/runtime/foundation.js").read_bytes()).hexdigest()
    baseline = json.loads((ROOT / "evidence/2026-11-14/builds.json").read_text(encoding="utf-8"))
    assert {x["id"] for x in first} == {x["id"] for x in baseline}
    historical_match = {x["id"]:x["sha256"] for x in first} == {x["id"]:x["sha256"] for x in baseline}
    checked_on = date.today().isoformat()
    report = {"date":checked_on, "technicalPass":True, "games":first,
              "relativeLinksChecked":count, "deterministicBuild":True,
              "isolatedSkillInstallAndBuild":True, "overwriteRejected":True,
              "changedFoundationRejected":True, "nodeSyntaxChecked":bool(node),
              "matches20261114GameplayArtifacts":historical_match,
              "localeUnitChecks":bool(node),
              "note":"Static/package checks. Browser and gameplay evidence are recorded separately."}
    output = ROOT / "evidence" / checked_on / "repository-check.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"PASS: four reproducible games, isolated install/build, {count} local links; Node syntax: {bool(node)}")


def release_check():
    rights = json.loads((ROOT / "docs/provenance/rights.json").read_text(encoding="utf-8"))
    blocked = [item for item in rights["items"] if item["releaseBlocker"] and item["status"] != "cleared"]
    if blocked:
        print("PUBLIC RELEASE NOT CLEARED (technical checks are separate):")
        for item in blocked:
            print(f'- {item["id"]}: {item["action"]}')
        return 2
    print("Recorded release blockers are closed. This checks records, not legal sufficiency.")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--release", action="store_true", help="Only check recorded public-release blockers")
    args = parser.parse_args()
    if args.release:
        sys.exit(release_check())
    try:
        check()
    except (AssertionError, ValueError, FileNotFoundError, subprocess.CalledProcessError) as exc:
        sys.exit(str(exc))
