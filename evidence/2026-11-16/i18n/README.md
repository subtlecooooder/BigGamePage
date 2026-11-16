# Bilingual release verification / 双语版本验证

The final published artifacts are identified by `http-artifacts.json` and `summary.json`. Their complete route records are `harbor-playthrough.json`, `moon-playthrough.json`, `bunker-playthrough.json` and `freight-playthrough.json`. Each explicitly records its HTML SHA-256.

`final-language-switch.json` compares the same paused mission before and after English → Chinese → English. `warning-layout.json` records a visible, wrapped English warning and its viewport bounds. The matching final images include `harbor-complete.jpg`, `moon-in-play.jpg`, `bunker-in-play.jpg`, `freight-warning.jpg`, `freight-complete.jpg` and `final-pause-*.jpg`.

Files named `before-*`, `local-*`, `online-*`, plus the ordinary-mode and narrow-menu records, preserve earlier inspection iterations. They must not be relabeled as final-build playthroughs. Their original hashes remain in their associated JSON files. `observations.json` describes the issues found and fixed. Raw diagnostic event names are deliberately not localized.

Full results, links and validation limits are in [the testing guide](../../../docs/testing.md).
