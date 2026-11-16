# 来源与许可证记录

## 原始游戏

底座继承用户提供的《几猫国产3A大作_V1.html》及此前本地制作的沙漠设备／攀爬扩展。原始文件名和作者标识仅在来源记录中保留，不再作为 BigGamePage 的产品品牌或场景商标展示。本次更名不改变原作品的作者、著作权或分发权限，也不声称继承代码由本项目独立创作。

原始内联脚本 SHA-256：`96ec824cb4f09ee11915322be8357555e79c6ff00f301774552e398555e10476`。当前底座哈希和提取记录见 Skill 内的 `assets/foundation-manifest.json`。

整套原始游戏的公开再分发许可尚未核实。项目以源码预览提供于 [BigGamePage 仓库](https://github.com/subtlecooooder/BigGamePage)，公开可见不等于授予原作再分发权。公开分发继承底座或游戏成品前，需要取得相应授权；也可另行制作要求使用者自行提供合法底座的工具版本。

## Three.js r180

内嵌渲染库是 Three.js r180，采用 MIT 许可证。本次检查发现旧交付虽然提及 MIT，但未包含完整许可文本；现已根据 [r180 上游 LICENSE](https://github.com/mrdoob/three.js/blob/r180/LICENSE) 补入 `assets/THREE-LICENSE.txt`，并随每个单 HTML 导出嵌入。其版权归 three.js authors 所有。

该许可证只覆盖相应的 Three.js 代码，不代表原游戏其余代码、模型生成器和素材也获得 MIT 授权。不要为整个包套用一个未经确认的统一开源许可证。

## 本地扩展与品牌

本项目名称为 **BigGamePage · 一页大作**，口号为 **Big games. One page.**。本地扩展包括制作 Skill、配方、构建器、设备和攀爬适配、独立地图与玩法模块、输入验收路线及文档。

游戏中的“一页”物流、装备和设施铭文为替换后的虚构场景标识。技术库名称、必需的许可和作者来源记录不作为营销品牌替换。

## 2026-11-16 来源追踪补充 / Provenance follow-up

经用户提供链接核查，公开镜像为 [realcodebear/saltline-fable-5.2](https://github.com/realcodebear/saltline-fable-5.2/tree/09c51774cd77aad750bd2d6c42af2b1020cb668d)。该提交仅包含 README.md 和 index.html，没有 LICENSE。README 自称镜像，并将 Saltline 原始实验归于 Felix Rieseberg；这不是镜像可再许可的证明。原作者展示与 Artifact 在本轮工具访问中未能完整读取。

用户文件最长脚本的 1,360 个完整 1 KB 块中，1,278 个（93.9706%）可在镜像脚本中找到完全相同字节。此比较支持来源关系，不证明完整同一性或著作权归属。中文修改的来源与授权仍待核查。完整源码预览仓库另附 docs/licensing.md 和 docs/provenance/source-record.json；本独立 Skill 随包保留本说明。

The source mirror attributes Saltline to Felix Rieseberg but supplies no game-wide license at the inspected commit. Code overlap supports lineage, not redistribution permission. The inherited game, procedural assets and derivative media remain uncleared; no blanket license applies to this Skill bundle.
