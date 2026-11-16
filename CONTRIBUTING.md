# Contributing / 参与开发

Read [license status](LICENSE-STATUS.md) first. The source preview still has unresolved distribution permissions; public visibility is not a reuse license. 提交新增内容时写明来源、可授权范围和第三方依赖，不以本文件替代贡献者许可。

## Development workflow

1. Use Python 3.9+; run `python3 scripts/build.py` and `python3 scripts/check.py` from the repository root.
2. Edit source files in `skills/big-game-page/` or the showcase in `site/`; never hand-edit generated `site/games/` output.
3. A theme change belongs in a recipe or supported world decorator. A new map/loop needs its own modules and input-driven acceptance route.
4. Keep complete models, enterable spaces and collision consistent. Do not simplify assets or disable normal damage to make a test pass.
5. Include what changed, why, exact artifact hashes and relevant verification. UI changes need screenshots at desktop and narrow widths. Gameplay changes need actual-input evidence and failures, not only inspection-camera captures.

The current package check deliberately compares outputs to the 2026-11-14 baseline. When a legitimate gameplay/code revision changes bytes, preserve the old evidence, record new tested hashes under a new date and update the check's baseline reference as part of that reviewed change. Do not silently rewrite old results to make the checker pass.

不要提交个人绝对路径、令牌、`.env`、浏览器配置、缓存或未经授权的素材。Use the issue template for browser/version, recipe, seed, hash, reproduction steps and observations. A count or benchmark is useful supporting evidence, not proof of visual quality or fun.
