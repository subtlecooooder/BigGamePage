# License status / 许可状态

**2026-11-16：尚未为整个项目授予统一开源许可证。 / No project-wide open-source license has been granted.**

This repository contains mixed-origin code and derived media. A public GitHub repository, attribution, a disclaimer, or an AI-generated origin does not supply missing redistribution permission.

本仓库包含继承底座及游戏截图。源码公开可见不代表许可已齐备，也不授予未知权利的再许可。

| 范围 / Scope | 当前状态 / Current status |
|---|---|
| Embedded Three.js r180 | MIT；完整文本见 [THREE-LICENSE.txt](skills/big-game-page/assets/THREE-LICENSE.txt) |
| Inherited game code / 继承游戏代码 | 未找到明确的整体修改、再分发或再许可授权 / Not cleared |
| Procedural models, materials, audio / 程序化模型、材质、音频 | 生成器继承原游戏；随原作授权核查 / Not cleared |
| Chinese adaptation / 中文改版 | 与来源镜像不完全相同；修改者及授权范围待核查 / Not cleared |
| Game HTML, screenshots, recordings / 衍生成品 | 依赖上述权利范围 / Not cleared |
| New Skill, extensions, tools and docs / 新增部分 | 维护者需确认可授权范围并选定许可证 / License selection pending |

Three.js 的 MIT 许可只适用于对应库代码。本项目尚未添加一个覆盖所有内容的 `LICENSE`；这是有意保留的真实状态，而不是漏写。

完整清单：[中文](docs/licensing.md) / [English](docs/licensing.en.md)。机器可读记录：[rights.json](docs/provenance/rights.json)。发布检查：`python3 scripts/check.py --release`，当前应列出待解决项并退出 2。

新增、可独立授权的工具代码可考虑 MIT，但这里的建议不构成实际许可授予。收到原作许可后，应按其要求选择相容的许可结构并保留署名；不能先放一个 MIT 标牌覆盖未知来源内容。
