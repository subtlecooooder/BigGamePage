# Deployment and release / 部署与发布

Repository: [subtlecooooder/BigGamePage](https://github.com/subtlecooooder/BigGamePage). Online demos: [English](https://subtlecooooder.github.io/BigGamePage/?lang=en) / [简体中文](https://subtlecooooder.github.io/BigGamePage/?lang=zh).

The maintainer has requested both the public source preview and GitHub Pages deployment. 公开源码与在线试玩均按维护者明确要求提供；这不改变原作、中文修改、程序化素材、衍生媒体及新增代码的许可待确认状态。No blanket open-source license has been added. Historical preparation and browser records describe the version checked at that time.

## Pages workflow / 部署流程

`.github/workflows/pages.yml` runs on pushes to `main` and manual dispatches:

1. Check out the source and read the GitHub Pages configuration.
2. Run `python3 scripts/build.py` to generate all four standalone games into `site/games/`.
3. Run `python3 scripts/check.py` to validate reproducibility, size, the complete Skill and documentation links.
4. Upload the complete `site/` directory, including the generated games, catalog, screenshots and `.nojekyll`.
5. Deploy that artifact to the `github-pages` environment. Only the deploy job receives Pages write and OIDC permissions.

The build job must succeed before deployment. Pull requests also run `.github/workflows/checks.yml`; they do not deploy. `site/games/` stays Git-ignored because Actions rebuilds it. Relative URLs preserve the `/BigGamePage/` subpath. No custom domain or Release download package is configured.

Workflow setup follows [GitHub's custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). The source-only check uses read permission; deployment adds the permissions required to publish this requested site.

## Verify a deployment / 部署后验证

Check the [Pages workflow](https://github.com/subtlecooooder/BigGamePage/actions/workflows/pages.yml), then open the actual HTTPS site. Verify both landing languages and all four game links. Test silently with `noaudio=1`, keep normal enemies/damage, and distinguish a complete input route from startup-only checks. Compare downloaded game bytes with their local build manifests. A successful Actions job alone does not prove browser playability.

Default GitHub README: [English](../README.md). Chinese README: [简体中文](../README.zh-CN.md). Both contain the hosted arcade and four direct game URLs. The GitHub repository's homepage field also points to the arcade.

## Permission inventory / 授权记录

`python3 scripts/check.py --release` checks permission records only. It still exits **2** while five categories remain unresolved. See [中文清单](licensing.md) / [English inventory](licensing.en.md). That result is kept separate from build/deployment status; publishing does not convert pending rights into cleared rights.

For a future licensed release, preserve the applicable license or written grant and version, resolve adaptation/asset scope, select scoped licenses for new contributions, update the inventory with evidence, then package the complete Skill and game artifacts with notices and hashes. Never apply a project-wide MIT badge merely because Three.js is MIT-licensed.

## Repository metadata

- Name: `BigGamePage`
- Tagline: `Big games. One page.`
- Default language: English, with a prominent Chinese link.
- The under-2-MB claim applies to each exported game, not the whole repository or website.
