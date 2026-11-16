# Code, assets and redistribution inventory

[简体中文](licensing.md) · [License status](../LICENSE-STATUS.md) · Reviewed 2026-11-16

**Code evidence supports the source relationship; permission to publicly redistribute the complete package remains unresolved.** The maintainer is making the repository a source preview; that decision is not an upstream permission grant. The unresolved records remain unchanged.

## Provenance and confidence

- The direct input was the user-supplied `几猫国产3A大作_V1.html`, 1,425,707 bytes, SHA-256 `9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966`. No game-wide license or permission statement was found in it. Promotional copy is not an ownership record.
- The user-provided [mirror](https://github.com/realcodebear/saltline-fable-5.2/tree/09c51774cd77aad750bd2d6c42af2b1020cb668d) contains only `README.md` and `index.html` at the audited commit. Its README calls it a Saltline mirror and credits Felix Rieseberg with the original experiment. That is an attribution lead, not evidence of the mirror maintainer's sublicensing authority.
- Splitting the user file's longest inline script into complete 1,024-byte blocks produced 1,360 blocks; 1,278 (**93.9706%**) occur byte-for-byte somewhere in the mirror script. This supports shared code, not a complete diff, authorship determination or rights grant. The scripts differ.
- The linked [author presentation](https://x.com/felixrieseberg/status/2119925633564463609) returned 403 and the [Claude Artifact](https://claude.ai/artifact/BGY1SztrAYcJQHSsnHHGmp) could not be retrieved by the audit tool. No original permission terms were obtained from those pages.
- BigGamePage adds local supply/climbing extensions, themes, an independent freight map and loop, QA routes and authoring tools. [Source hashes](provenance/source-record.json) and the [foundation manifest](../skills/big-game-page/assets/foundation-manifest.json) identify the reviewed inputs. Renaming must not erase provenance.

A public upload, attribution, educational disclaimer or AI-generated origin does not substitute for a license. GitHub explains that publishing a repository without a license does not generally grant others permission to reproduce, distribute or create derivatives. [GitHub's licensing guide](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)

## Inventory

| Component | Observed status | Remaining action |
|---|---|---|
| Embedded Three.js r180 | MIT; full notice included in each export | Preserve the notice and its limited scope; [official license](https://github.com/mrdoob/three.js/blob/r180/LICENSE) |
| Inherited engine, gameplay, UI and AI (`foundation.js`, `shell.html`) | Substantial shared game code; no whole-game grant found | Identify an authorized rights holder and the applicable version, modification, source redistribution, sublicensing and commercial terms |
| Chinese adaptation | Not identical to the mirror; no separate license found | Attribute the changes and resolve their permission, or recreate them on a legitimately modifiable upstream |
| Procedural dogs, drones, weapons, buildings and props | Geometry generators inherited from the game | Include generators, model designs, outputs and derivatives in the rights inquiry |
| Materials, textures, sky and shaders | Generated in code; no separate downloaded texture pack found | Resolve permission for the generators and any upstream third-party inputs |
| Audio generators | Synthesized in code; no separate audio/music files found | Resolve code/derived-audio permissions; audio mix testing is a separate unfinished technical item |
| New Skill, recipes, tooling, extensions, map and docs | Locally authored additions can be identified | Maintainer must confirm the licensable scope, attribution and license; separate inherited and adapted portions |
| Built HTML, screenshots and recordings | Derived from the game | Confirm source/artifact distribution, online play and promotional media permissions before releasing them |
| Fonts and visible branding | System-font fallbacks; no font binaries; fictional scene labels | Do not relicense OS fonts or treat renamed branding as a transfer of ownership |

“Unresolved” means evidence is insufficient for release clearance; it is not a finding that infringement has occurred. Procedurally generated assets are not automatically free of rights, and Three.js MIT does not license the surrounding game.

## Permission request scope

Ask the actual rights holder to identify the covered game version, procedural model/material/audio generators and third-party exclusions; permission for modification, source redistribution, hosted/downloadable derivatives, Skill bundles, screenshots/video and commercial use; and the required license, notices and attribution. A draft inquiry is included in the [Chinese guide](licensing.md). No message has been sent on the maintainer's behalf.

## Two release paths

**A. Resolve permissions for the foundation.** Preserve a verifiable license or written grant, resolve the Chinese adaptation and asset scope, then select a license for new contributions and release the package/demo.

**B. Publish only independently licensable tooling.** Exclude the inherited foundation/UI, derived games and media, require users to provide compatible resources they are entitled to use, or author a replacement foundation. The current full source preview is not that reduced package, and the current builder does not accept arbitrary HTML inputs.

Record evidence in [rights.json](provenance/rights.json). Changing a status to `cleared` does not itself grant rights. There is deliberately no project-wide MIT badge or license yet. GitHub Pages is deployed at the maintainer's explicit request after technical checks. This deployment does not clear any permission gaps. No Release download package has been published.
