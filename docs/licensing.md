# 代码、素材与发布授权清单

[English](licensing.en.md) · [许可状态](../LICENSE-STATUS.md) · 核查日期：2026-11-16

**结论：来源关系已有较强代码证据，整包公开分发许可仍未找到。** 仓库按维护者要求以源码预览公开；这一决定不等于获得原作授权，许可清单保持待确认。

## 来源链与证据强度

1. 直接输入是用户提供的《几猫国产3A大作_V1.html》，1,425,707 字节。原始文件 SHA-256 为 `9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966`。文件中未找到完整游戏的许可证或明确再分发条款；文件内的宣传语不是权属证明。
2. 用户提供并经核查的[来源镜像](https://github.com/realcodebear/saltline-fable-5.2/tree/09c51774cd77aad750bd2d6c42af2b1020cb668d)在该提交只含 `README.md` 和 `index.html`。镜像自称来自 Saltline，并将原始实验归于 Felix Rieseberg；这是镜像的来源说明，不是其有权再许可的证明。
3. 以用户文件最长内联脚本分为 1,360 个完整 1,024 字节块，其中 1,278 个可在镜像脚本找到完全相同的字节序列，比例为 **93.9706%**。这支持直接代码关系，但不是完整 diff、作者身份鉴定或权利证明；两份脚本不相同。
4. 镜像给出的[原作者展示](https://x.com/felixrieseberg/status/2119925633564463609)与 [Claude Artifact](https://claude.ai/artifact/BGY1SztrAYcJQHSsnHHGmp)在本次工具访问中分别遇到 403 和读取失败，未取得可以授权再分发的原始条款。
5. BigGamePage 在中文底座上继续加入补给、攀爬、主题适配、独立货运地图和玩法、QA 路线与构建 Skill。当前底座和历史输入文件的哈希见 [source-record.json](provenance/source-record.json) 与 [底座清单](../skills/big-game-page/assets/foundation-manifest.json)。来源记录不得因为更名而删除。

不能把“有人已上传 GitHub”“附了作者名字”“标注学习用途”“AI 生成”当作完整许可。GitHub 官方说明，没有许可证通常不会自动授予复制、分发和创作衍生作品的权利。[GitHub 许可说明](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)

## 逐项清单

| 内容与位置 | 已确认什么 | 仍缺什么 | 具体解决办法 |
|---|---|---|---|
| Three.js r180，内嵌于 `foundation.js` | 官方 r180 为 MIT；完整声明已嵌入每个输出 | 没有发现这部分的许可文本缺口；需持续保留声明 | 构建时保留 [THREE-LICENSE.txt](../skills/big-game-page/assets/THREE-LICENSE.txt)，不扩大其覆盖范围 |
| 原游戏逻辑、渲染封装、UI、武器与敌人 AI，`foundation.js` / `shell.html` | 用户文件与 Saltline 镜像有大段相同代码 | 原作权利人、修改/源码分发/再许可/商业使用范围 | 向能授予相关权利的原作者或权利人取得明确条款，或定位其正式许可证及适用版本 |
| 中文改版差异、标识与文本 | 两份主脚本并非字节一致；原中文文件没有许可证 | 谁做了差异部分、是否包含其他来源、是否可分发 | 完成差异归因；取得修改部分授权，或在允许修改原作的前提下重新实现这部分 |
| 机器狗、无人机、枪械、仓库、集装箱、小物件生成器 | 主要是程序化几何，精细模型直接继承 | 生成器与模型设计的适用权利 | 与原作一起明确生成器、几何输出、改编与分发权；不把“程序生成”写成“无版权” |
| 材质、纹理、天空和着色器 | Canvas / shader 等代码生成；未发现独立下载贴图包 | 生成逻辑及可能的第三方来源授权 | 记录上游来源与授权；不能仅凭没有 PNG/JPG 文件判定无需许可 |
| 音效与声音生成器 | Web Audio 等代码生成；未发现独立音乐/音效文件 | 声音生成代码的分发权；混音未实听验收 | 与底座授权一起解决，分开记录技术测试状态 |
| 新 Skill、配方、脚本、设备/攀爬扩展、独立地图和文档 | 本地迭代新增部分，可定位文件 | 可独立授权的边界、维护者署名及许可证选择 | 维护者确认范围后为新增代码选许可；与继承底座分别列明，必要时对依赖底座的改编部分继续核查 |
| 生成的游戏 HTML、`site/assets/screens/`、玩法录像 | 派生于现有游戏；截图日期与机位可追溯 | 公开托管、下载、截图/视频展示和推广是否获准 | 授权范围明确包含构建成品及媒体展示；维护者已要求部署 Pages；该部署决定不补足上游授权，清单继续待确认 |
| 字体、展示品牌 | 使用系统字体回退，无字体文件分发；场景标识已换成虚构“一页”系列 | 系统字体不由本项目再许可；改名不是权属清理 | 保留真实依赖和来源署名；不宣称更名消除了原作权利 |

Three.js 的许可来源：[官方 r180 LICENSE](https://github.com/mrdoob/three.js/blob/r180/LICENSE)。本表中的其他“待确认”不表示已经认定侵权，而是当前没有足够证据完成公开发布判断。

## 向权利人核实的最小范围

准备发送的询问应附来源版本和本项目改动说明，问清：

- 该版本原游戏及其模型、纹理、音效生成代码的权利人和第三方例外。
- 是否允许修改、公开分发源码、提供单 HTML 下载与在线试玩。
- 是否允许发布改编游戏、Skill 底座包、截图与演示视频，是否允许商业使用。
- 应采用的许可证、署名方式、保留声明及再许可限制。

英文询问草稿（本项目没有替你发送）：

> We are preparing BigGamePage, a local authoring toolkit and modified single-file game demos derived from the Saltline mirror at commit 09c51774cd77aad750bd2d6c42af2b1020cb668d via a Chinese adaptation. A source preview is being made public by the maintainer while these permission questions remain unresolved. Could you confirm who can authorize the underlying game and procedural asset generators, and whether modification, source redistribution, downloadable/hosted derivatives, screenshots/video and commercial use are permitted? Please identify the applicable license, attribution requirements and any third-party exclusions. We can provide the source hashes and a change inventory.

## 发布前的选择

**路线 A：取得底座授权。** 保存可复核许可链接或书面授权范围，确认中文修改和素材覆盖范围，选择项目新增部分的许可证，再开放整包与试玩。

**路线 B：不分发继承内容。** 若无法取得授权，另做只包含可独立授权工具和文档的版本；排除底座、继承 UI、衍生游戏和截图，让使用者自行提供有权使用的兼容资源，或重新创作可明确授权的底座。当前这个完整源码预览还不是路线 B 的可发布包，也不能让现有构建器接受任意 HTML。

更新 [rights.json](provenance/rights.json) 时必须附证据，状态改为 `cleared` 不能代替授权。维护者选定新代码许可前不加覆盖整包的 MIT 徽章。GitHub Pages 按维护者明确要求部署；这不改变任何待确认条目的状态。Pages 工作流在技术检查通过后发布演示，Release 下载包未发布。
