# GitHub release preparation / 发布准备

Repository: [subtlecooooder/BigGamePage](https://github.com/subtlecooooder/BigGamePage). The maintainer has requested public source publication through `gh`. 本次按维护者要求公开源码预览；GitHub Pages、Release 下载包和自动部署不在此次推送范围。

Public visibility does not grant missing rights. The five unresolved permission/license categories remain recorded as pending; no blanket open-source license has been added. 历史 `evidence/2026-11-16/preparation.json` 记录的是公开前准备状态，不是当前远端状态。

## Current blockers / 当前阻塞

Run `python3 scripts/check.py --release`. At present it exits **2** for unresolved inherited code, Chinese modifications, procedural assets, demo media and the project's own license selection. Details and the proposed permission inquiry are in [licensing](licensing.md) / [English](licensing.en.md).

The repository contains the full inherited foundation, HTML shell and game screenshots. Ignoring generated `site/games/` is a repository hygiene choice, not a rights workaround. The maintainer's source-publication decision does not clear permissions for inherited content. These gaps must remain visible in the README and license records.

## Once permissions are documented / 授权齐备后

1. 保存适用版本、权利人、许可文本或书面授权与例外；更新 `docs/provenance/rights.json`，并附可复核依据。Select and add scoped license file(s) for the portions the maintainer can license.
2. 重建并校验：`python3 scripts/build.py`、`python3 scripts/check.py`、`python3 scripts/check.py --release`。Review actual gameplay if runtime changes; do not reuse old hashes for changed files.
3. 仓库 URL 已确定为 https://github.com/subtlecooooder/BigGamePage 。若后续启用 Pages 或 Release，再补实际验证的试玩与下载链接。
4. 审查将上传的文件，尤其是继承源码、截图、许可证和本地路径。Commit only the intended repository files; keep caches, generated demos and local installation directories out of the source history.
5. 用户明确发布后再推送。For a Pages site, build first and deploy the complete `site/` folder; it uses relative URLs and works under a repository subpath. Include `games/`, `assets/` and `.nojekyll` in the deployed output, even though generated games are Git-ignored.
6. For a Release, package the complete Skill directory with its notices and manifests, and attach the individual HTML files and build hashes. Keep the `<2 MB` claim scoped to each game, not the entire repository or Skill ZIP.

The supplied workflow runs build/package checks only. It has read-only repository permissions, no deployment credentials, no release upload and no Pages job. Local checks of those commands do not constitute a successful hosted Actions run.

## Suggested repository metadata / 建议仓库介绍

- Name: `BigGamePage`
- Description: `Big games. One page. A Skill and toolkit for detailed single-HTML 3D games under 2 MB.`
- Topics: `single-file`, `html-game`, `procedural-generation`, `threejs`, `agent-skills`
- Primary README: Chinese, with a prominent English link.

Only use “open source” and a license badge after the matching permission and license scope are actually in place.
