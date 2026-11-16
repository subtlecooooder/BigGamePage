# Testing and evidence / 测试与证据

## What is being verified / 验证层次

1. **Build/package:** deterministic output, size, resource references, pinned source, installed Skill independence, local documentation links.
2. **Browser UI:** landing page at desktop/mobile widths, language toggle, screenshots loading, game links and silent startup.
3. **Gameplay:** actual-input movement, aiming, shooting and interaction routes under normal enemies and damage. Inspect frames separately from numerical checks.

静态检查不代替游玩；检查机位不证明角色抵达；自动路线通关不证明人类觉得有趣。每份实测应绑定 HTML 哈希，保留失败记录，区分本轮与历史证据。

## 2026-11-14 gameplay baseline / 历史游玩基准

These records belong to the v0.3 branding baseline, before the repository reorganization. 旧记录保留其原始 HTML 哈希；v0.4 双语界面构建会改变文件字节，必须提供新一轮实测，不能将这些旧通关记录改标为新版本。

| Game | Input-route result | Link |
|---|---|---|
| 夜港无声 / Silent Harbor | 61.03 s, completed; six kills, minimum HP 85, supplies/EMP/door | [Report](../evidence/2026-11-14/harbor-playthrough.json) |
| 月面余氧 / Lunar Reserve | 60.10 s, completed; five kills, oxygen and resupply | [Report](../evidence/2026-11-14/moon-playthrough.json) |
| 地底九号 / Bunker Nine | 63.08 s, completed; seven kills, fuse acquired/consumed | [Report](../evidence/2026-11-14/bunker-playthrough.json) |
| 零号中转站 / Switchyard Zero | 196.15 s, west-route delivery; 17 kills, minimum HP 65, four supplies and one repair | [Report](../evidence/2026-11-14/freight-west-playthrough.json) |

Thermal recovery: automatic overheat at 76.920 s with five enemies alive, hot interaction rejected, natural cooling at 0.09/s, same core recovered at 82.218 s and loaded at 88.390 s; minimum HP 36. See [trace](../evidence/2026-11-14/freight-thermal.json) and [verification](../evidence/2026-11-14/thermal-verification.json).

Real keyboard/mouse checks from the same date covered movement, fallback view, crouch, map, fire, reload, pause and normal restart. See [controls report](../evidence/2026-11-14/manual-controls.json). Original full logs, including unsuccessful attempts, remain in the earlier local delivery. The selected JSON files here remove local paths and test-server URLs but retain results and artifact hashes; they are not represented as untouched source logs or new runs.

Build identities: [builds.json](../evidence/2026-11-14/builds.json). Naming-only scope and model baseline: [source scope](../evidence/2026-11-14/source-scope.json).

## 2026-11-16 repository and showcase checks / v0.3 整理验收

- At the v0.3 repository-preparation commit, four rebuilt games matched the historical SHA-256 values exactly; all remained below 2,000,000 bytes. These byte comparisons predate the v0.4 localization work.
- The complete Skill was installed into a temporary directory and built independently. Duplicate installation and a tampered foundation were rejected. The Skill creator's validator and YAML parsing also passed; its optional PyYAML dependency was isolated in a temporary directory, not added to this project or the global Python environment.
- Inspected Chinese and English showcase layouts at desktop widths and 390 px. Images loaded, language and sound-link toggles worked, command copying succeeded, and no horizontal overflow was observed. The sound toggle was returned to off before entering a game.
- Entered Switchyard Zero through its showcase link with `noaudio=1`, started a normal session, sent forward input, inspected the rendered scene and paused normally. No console errors were captured on the showcase or during this startup check. This was not a new full gameplay route, audio-mix test or mobile-game test.
- The first browser wait targeted a boot element that remains in the DOM; that wait timed out even though the menu was ready. The menu was then inspected directly and the session started successfully. No game code change was needed for this observation issue.
- Public-release check returns 2 with five unresolved rights/license categories. That is separate from passing technical validation. Hosted Actions results and the later Pages checks are recorded separately below.

[Package results](../evidence/2026-11-16/repository-check.json) · [Browser record](../evidence/2026-11-16/browser-check.json) · [Desktop Chinese](../evidence/2026-11-16/browser/desktop-zh.jpg) · [Desktop English](../evidence/2026-11-16/browser/desktop-en.jpg) · [Narrow English](../evidence/2026-11-16/browser/mobile-en.jpg) · [Silent game startup](../evidence/2026-11-16/browser/freight-start.jpg)

## 2026-11-16 v0.3 live Pages verification / 历史公网部署实测

Opened the actual [HTTPS arcade](https://subtlecooooder.github.io/BigGamePage/) after the [Pages deployment](https://github.com/subtlecooooder/BigGamePage/actions/runs/43796435285) and [technical checks](https://github.com/subtlecooooder/BigGamePage/actions/runs/43796435268) succeeded for `7682dcf5b78040a27cb49af579f5467f30108b22`. English is now the repository's default README; both README languages link to the arcade and each game.

新一轮测试直接运行公网版本：用页面上可见的 QA 按钮合成正常移动、瞄准、射击、换弹和交互输入，保留敌人及伤害；没有修改坐标、血量、弹药或任务状态，没有用检查机位代替玩家抵达。四款均首次完成本轮路线，未出现阵亡重试。夜港还单独验证了不带 QA 参数的正常开始、前进与 Escape 暂停。

| Online game | Fresh result | Evidence |
|---|---|---|
| 夜港无声 / Silent Harbor | 61.58 s; 3 objectives, 6 kills, minimum HP 95, 2 supplies | [Report](../evidence/2026-11-16/pages/harbor-playthrough.json) · [Complete](../evidence/2026-11-16/pages/harbor-complete.jpg) |
| 月面余氧 / Lunar Reserve | 63.48 s; 3 objectives, 5 kills, minimum HP 86, minimum oxygen 78.32%, 3 supplies | [Report](../evidence/2026-11-16/pages/moon-playthrough.json) · [In play](../evidence/2026-11-16/pages/moon-in-play.jpg) |
| 地底九号 / Bunker Nine | 63.08 s; fuse acquired and consumed, 3 objectives, 7 kills, minimum HP 95 | [Report](../evidence/2026-11-16/pages/bunker-playthrough.json) · [In play](../evidence/2026-11-16/pages/bunker-in-play.jpg) |
| 零号中转站 / Switchyard Zero | 208.66 s; W/U/E loaded, reached the 4.8 m upper ring, west delivery, 19 kills, minimum HP 76, 4 supplies, 1 repair; 16 assertions passed | [Report](../evidence/2026-11-16/pages/freight-playthrough.json) · [Delivered](../evidence/2026-11-16/pages/freight-complete.jpg) |

- All four report `audioContext: stub`, no invulnerability, no captured runtime errors and no runtime resource requests. Full dog/drone geometry hashes remain `56cdfa8c` / `aabcf30a`. Sampled actual gameplay views were inspected separately from the assertions.
- The freight run triggered four recovery waves. Its carrier fell to 81.21 HP, used one finite repair kit and finished at 95.78 HP. The dedicated thermal recovery, east escort and rail-probe scenarios were not repeated in this deployment check; their earlier evidence remains separate.
- The landing page was checked in English and Chinese. All four links contain `noaudio=1`; the default sound checkbox is off and all four preview images loaded. Downloaded HTML, catalog, JavaScript, CSS and images returned HTTP 200 and match local bytes. Each game remains below 2,000,000 bytes.
- Environment: desktop in-app browser, 1280 × 720 CSS pixels, DPR 2, `q=high&dynres=0&seed=4207&noaudio=1`. This is silent desktop route verification, not mobile, audio-mix or broad performance acceptance.
- Observation issues were retained: the first menu wait timed out even though its diagnostic showed a visible start button; direct UI inspection then succeeded. An initial HTTP checker mistakenly requested `/catalog.json`; the real site uses `/games/catalog.json`, which passed. Neither required a game or site fix.

[Machine-readable summary](../evidence/2026-11-16/pages/summary.json) · [HTTP hashes](../evidence/2026-11-16/pages/http-artifacts.json) · [Browser record](../evidence/2026-11-16/pages/browser-check.json) · [Online homepage](../evidence/2026-11-16/pages/arcade-home.jpg) · [English homepage](../evidence/2026-11-16/pages/arcade-en.jpg)

## Reproduce static/package checks

```sh
python3 scripts/build.py
python3 scripts/check.py
```

The checker builds twice in a temporary directory, compares the actual bytes with the showcase, records whether they still match historical hashes, installs the complete Skill into another temporary directory, builds from that installation, rejects a duplicate install and rejects a changed foundation. It checks local Markdown/HTML links and JSON. Node.js adds exported-JavaScript syntax checks and 73 language-selection/translation cases when present. Its dated output is `evidence/2026-11-16/repository-check.json` and reflects the latest build, not the v0.3 byte comparison above.

To validate the saved thermal trace, first inspect the verifier's CLI:

```sh
python3 skills/big-game-page/scripts/verify_thermal.py --help
```

## Repeat gameplay manually or with the visible driver

Serve `site/` and open a game with `?qa=1&q=high&dynres=0&seed=4207&noaudio=1`. Use the visible panel for the supported route. The driver produces movement/look/fire/reload/interaction inputs; do not set health, ammo, position, objectives or invulnerability to force success. Keep normal enemies/damage. If a character dies, preserve the failure and retry with a valid strategy.

The freight thermal case is labeled **过热移动实测**. It must prove a reachable hot core rejects held E, cools naturally, is recovered and loaded, with active enemies. A stationary obstructed route or an out-of-reach interaction cannot satisfy it.

Review actual frames at matched quality settings. Record browser/viewport, drawing-buffer size, seed, file hash, console errors and runtime requests. See the [acceptance contract](../skills/big-game-page/references/acceptance.md) for stair/rail, reinforcement, traversal, route, pause/reset and failure cases.

## Known validation limits / 尚未完整验证

`file://` cold starts, explicit browser-offline mode, mobile touch play and sound mixing have not been fully accepted. Landing-page responsiveness is not mobile-game acceptance. Historical browser runs used a fallback view mode when pointer lock was unavailable. Neither the historical routes nor the new package checks establish broad device performance, combat balance or general stability.
