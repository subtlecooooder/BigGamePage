# 安装与使用

[English](getting-started.en.md) · [返回 README](../README.zh-CN.md)

## 直接试玩

打开 [在线演示站](https://subtlecooooder.github.io/BigGamePage/?lang=zh) 即可选择四款游戏；默认静音。仅试玩不需要 Python、Git 或 Skill，以下工具用于本地制作和验证。

## 运行环境

- Python 3.9 或更高版本；构建、安装、静态检查不需第三方 Python 包。
- 支持 WebGL2 的桌面浏览器与键鼠。浏览器自动化工具由使用的 AI 代理提供，不包含在 Skill 中。
- Node.js 可选，仅供 `scripts/check.py` 做 JavaScript 语法检查。
- AI 代理须能读写文件、执行 Python 并操作浏览器。仅有聊天窗口且不能访问文件时，无法完成此工作流。

当前为源码预览，含授权尚待确认的底座。获取到这些文件并不等于取得公开再分发权；先看 [许可清单](licensing.md)。本指南不自动下载上游游戏。

## 构建与试玩

首次获取：

```sh
git clone https://github.com/subtlecooooder/BigGamePage.git
cd BigGamePage
```

在包含 `README.md` 的 BigGamePage 根目录运行：

```sh
python3 scripts/build.py
python3 scripts/check.py
python3 -m http.server 8000 --bind 127.0.0.1 --directory site
```

打开 http://127.0.0.1:8000/ 。四份游戏输出为 `site/games/<recipe-id>.html`，另有校验清单和 `catalog.json`。静态服务器没有上传功能，仅监听本机；结束时在终端按 Ctrl+C。

也可直接打开静音测试地址：

```text
http://127.0.0.1:8000/games/switchyard-zero.html?qa=1&q=high&dynres=0&seed=4207&noaudio=1
```

`noaudio=1` 使用音频 stub；`qa=1` 显示验收面板；`q=high` 固定画质档，`dynres=0` 关闭动态分辨率，`seed` 固定随机种子。不要把静音测试说成音效验收。普通试玩不需要 `qa=1`。

## 安装完整 Skill

推荐用户级安装：

```sh
python3 scripts/install_skill.py --dest ~/.agents/skills
```

或只在本项目使用：

```sh
python3 scripts/install_skill.py --dest .agents/skills
```

`--dest` 是父目录，脚本会创建其下的 `big-game-page/`。目录应含 `SKILL.md`、`agents/`、`references/`、`scripts/`、`assets/` 和 `SOURCE-NOTICE.md`。不要只复制一个 Markdown 文件，也不要同时装多个同名副本。

这些发现路径和 `$` 调用方式依据 [Codex 官方 Skill 文档](https://developers.openai.com/codex/skills)（2026-11-16 核对）。若代理配置使用其他目录，可显式传给 `--dest`；不要默认所有代理都支持同一安装方式。

安装脚本不下载内容，不改模型或浏览器配置。同名目录已存在时会报错并保留原目录。升级前先备份或移走你原有的 `big-game-page` 文件夹，再重新安装；删除对应安装目录即可卸载。Codex 未识别时重启后再输入 `$big-game-page`。

## 先做一个受支持的改版

在代理中输入：

```text
$big-game-page
以 assets/recipes/night-harbor.json 为基础创建“暴雨撤离”。
保留原港区布局，调整叙事、配色与弹药预算，不宣称是新地图。
从本次导出的文件进行静音输入路线测试，输出 HTML、配方、截图和哈希。
```

手动复现单份构建（在仓库根目录）：

```sh
python3 skills/big-game-page/scripts/build.py \
  --recipe skills/big-game-page/assets/recipes/night-harbor.json \
  --out dist/night-harbor.html
```

输出必须小于 2,000,000 字节，只有一个内联脚本，没有外部运行资源。`foundation.js` 与清单哈希不一致时构建会拒绝；不要删掉校验来消除错误。

## 再做不同地图与玩法

```text
$big-game-page
制作一款独立“设施抢修与撤离”游戏。
参考 freight-map.js 与 freight-game.js 的组织方式，复用模型工厂。
先给出房间连接、垂直动线、主要操作、资源取舍、失败/恢复/胜利条件。
实现自己的地图与控制器、碰撞和导航、开始/暂停/重开，再编写输入验收路线。
保留正常敌人与伤害，静音实测。单 HTML < 2,000,000 字节，无外部资源。
```

可用 `world` 只有 `harbor`、`moon`、`bunker`、`freight`；新增名称要同步扩展构建器、模块选择与测试。前三种共享 A→B→C→撤离和原布局。不能仅换标题或 JSON 就声称做了新类型。

具体字段、取值范围与扩展点见 [配方契约](../skills/big-game-page/references/recipe-contract.md)。每款仍要求三个任务描述；弹药容量、起始备弹和货运热管理等参数由构建器校验。

## 常见问题

| 现象 | 处理 |
|---|---|
| `python3` 不存在 | 先安装 Python 3.9+；Windows 可用 `py -3` 替代文档中的 `python3` |
| 页面有图，但试玩 404 | 从仓库根目录运行 `python3 scripts/build.py`，再从 `site/` 启动服务器 |
| 端口已占用 | 把命令中的 `8000` 和访问地址一起改为其他空闲端口 |
| Skill 被识别但资源缺失 | 重新安装完整文件夹；执行其 `scripts/validate_package.py` |
| `Pinned foundation changed` | 找回与 `foundation-manifest.json` 匹配的底座；修改引擎须审查、重定基准和重跑验收 |
| 浏览器不能锁定鼠标 | 按游戏提示使用备用视角控制；不要把自动输入路线视为锁鼠测试 |
| 授权检查退出码 2 | 属于当前已知发布阻塞，按清单取得证据；不能靠改状态字段凭空获得许可 |
