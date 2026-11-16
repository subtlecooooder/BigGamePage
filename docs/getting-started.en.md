# Install and use

[简体中文](getting-started.md) · [Back to README](../README.en.md)

## Requirements

Python 3.9+, a WebGL2-capable desktop browser, and keyboard/mouse. Python scripts use the standard library. Node.js is optional for exported JavaScript syntax checks. The AI agent must provide filesystem access, Python execution and browser controls; the Skill does not bundle an agent, browser automation runtime or model subscription.

This source preview includes a foundation whose redistribution permission remains unresolved. Possession of the files is not public-release permission; read the [licensing inventory](licensing.en.md). No script automatically downloads the upstream game.

## Build and play

First clone the project:

```sh
git clone https://github.com/subtlecooooder/BigGamePage.git
cd BigGamePage
```

Run from the repository root:

```sh
python3 scripts/build.py
python3 scripts/check.py
python3 -m http.server 8000 --bind 127.0.0.1 --directory site
```

Open http://127.0.0.1:8000/ . Builds create `site/games/<recipe-id>.html`, sidecar manifests and `catalog.json`. The server listens only on your machine; stop it with Ctrl+C. The game HTML has no dependency on its sidecar or the landing page.

A reproducible silent test URL:

```text
http://127.0.0.1:8000/games/switchyard-zero.html?qa=1&q=high&dynres=0&seed=4207&noaudio=1
```

`qa=1` enables the visible acceptance panel; `noaudio=1` uses an audio stub. `q=high`, `dynres=0` and `seed=4207` fix quality and random seed. Ordinary play does not need QA mode. Silent testing does not validate sound quality.

## Install the complete Skill

User-wide installation:

```sh
python3 scripts/install_skill.py --dest ~/.agents/skills
```

Or install only for this repository:

```sh
python3 scripts/install_skill.py --dest .agents/skills
```

`--dest` is the parent directory; the installer creates `big-game-page/` inside it. Keep `SKILL.md`, `agents/`, `references/`, `scripts/`, `assets/` and `SOURCE-NOTICE.md` together. A Markdown-only copy cannot build games. Avoid duplicate installations with the same Skill name.

These discovery paths and `$` invocation are documented in the [official Codex Skill guide](https://developers.openai.com/codex/skills), checked on 2026-11-16. Other agents may need a different path or installation method.

The installer downloads nothing and changes no model/browser settings. It refuses an existing destination. Back up or move your old Skill folder before upgrading; remove only that installed folder to uninstall. Restart Codex if the Skill does not appear, then invoke `$big-game-page`.

## Adapt an existing archetype

```text
$big-game-page
Create a storm-extraction adaptation of assets/recipes/night-harbor.json.
Retain the harbor layout. Change narrative, palette and ammunition budgets.
Identify it as a shared-layout adaptation. Test the exact exported file silently
and deliver the HTML, recipe, screenshots and SHA-256.
```

Build one recipe manually, from the repository root:

```sh
python3 skills/big-game-page/scripts/build.py \
  --recipe skills/big-game-page/assets/recipes/night-harbor.json \
  --out dist/night-harbor.html
```

The builder enforces fewer than 2,000,000 bytes, one inline script and no external runtime resources. It rejects a changed foundation hash. Do not bypass that check to hide a mismatch.

## Author a different map and loop

```text
$big-game-page
Create a distinct facility-repair-and-escape game using freight-map.js and
freight-game.js as structural references. Reuse the detailed asset factories.
Specify room connections, vertical routes, player actions, resource tradeoffs,
failure/recovery and victory first. Author the map, collision, navigation and
controller, including start/pause/reset, then add an actual-input test route.
Preserve normal enemies and damage. Test silently. One HTML under 2,000,000 bytes,
with no external runtime resources.
```

Supported `world` values are `harbor`, `moon`, `bunker` and `freight`. A new value requires changes to module selection, the builder and tests. The first three share the harbor layout and ordered A→B→C extraction. Recipe edits alone do not create a new genre.

See the [recipe contract](../skills/big-game-page/references/recipe-contract.md) for fields and extension points. Recipes require three objective descriptions; ammunition and freight mechanics are validated by the builder.

## Troubleshooting

| Symptom | Action |
|---|---|
| No `python3` command | Install Python 3.9+; on Windows, `py -3` can replace `python3` |
| Game link returns 404 | Run the build first, then serve the `site/` directory |
| Port already in use | Change both the server port and URL |
| Skill found but assets missing | Install the whole directory and run its `scripts/validate_package.py` |
| `Pinned foundation changed` | Restore the recorded foundation or review, re-baseline and re-test the engine change |
| Pointer lock unavailable | Follow the in-game fallback controls; input-driver success does not test pointer lock |
| Release check exits 2 | Resolve the recorded permission gaps; editing a status field is not a rights grant |
