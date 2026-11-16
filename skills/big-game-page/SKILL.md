---
name: big-game-page
description: Build and adapt detailed, self-contained 3D browser games from the included industrial FPS foundation. Use for a playable single HTML game under 2 MB, offline procedural assets, a new map or gameplay archetype, and visually verified game adaptations. Preserve detailed machine dogs, drones, enterable buildings and scene richness; author independent maps and rules when requested, then validate actual play and screenshots.
---

# BigGamePage · 一页大作

**Big games. One page.**

Deliver a playable HTML, editable recipe and evidence from the exact file. Version 0.4.0 supports Chinese/English interfaces, adaptations of the original harbor and an independently authored recovery/escort level. It does not promise arbitrary genres or arbitrary anatomy from a prompt.

## Choose the right scope

1. Read `references/architecture.md` and `references/recipe-contract.md`.
2. Define the layout, player verbs, resource tradeoffs, failure conditions and ending before choosing an implementation. Distinguish a theme adaptation from an independent game.
3. For an existing archetype, copy its recipe and change supported parameters. For a new layout or core loop, author new map/controller/QA modules. A recipe alone cannot invent mechanics.
4. Build with `python3 scripts/build.py --recipe <recipe.json> --out <game.html>`. Resolve paths from this skill's folder.

Keep `assets/runtime/foundation.js` pinned. Reuse its procedural geometry, materials, weapons and animation; extend through the adapter. **Asset fidelity does not require retaining the original map.** An independent map must replace the level factory and own its collision, navigation, route landmarks and traversal. An independent core loop must replace the game controller and own start, pause, reset, win and loss state.

## Quality contract

- Export strictly below **2,000,000 UTF-8 bytes**, one HTML and no external runtime resource, CDN, font, image, audio, API or service worker.
- Include English `locales.en.title`, `brief` and three `objectives` in every recipe. UI defaults to browser language; allow instant Chinese/English selection from the title and pause menus. New messages belong in `assets/locales/en.json`; never call a translation service at runtime. Test both languages and preserve gameplay state while switching.
- Preserve complete robot rigs. Reference hashes: dog `56cdfa8c` / 17,348 full-rig triangles; drone `aabcf30a` / 13,790. Static asset-only counts are 17,344 and 13,788. Do not replace them with simplified approximations.
- Retain enterable, detailed warehouses and open containers. Preserve small props, readable materials, silhouettes and traversal. Counts supplement visual review; they are not a quality score.
- **Legacy adaptations only:** retain the original 47 containers, 298 props, 794,188 static triangles and crane route to 30.34 m. These exact layout counts do not apply to independent maps.
- **Independent maps:** document a new spatial plan, protected play corridors, route alternatives, indoor transitions and vertical routes. Count their own assets; test every required entrance, stair landing and vehicle clearance. Do not camouflage a reused layout with color or labels.
- New core gameplay needs consequential decisions and dedicated failure/recovery behavior, beyond renamed A/B/C terminals. Reuse combat assets where appropriate.

## Verify through play

Read `references/acceptance.md`. Use the browser's required skill and the **exact exported HTML**, silently by default: `?qa=1&q=high&dynres=0&seed=4207&noaudio=1`.

The visible QA panel drives movement, look, fire, reload and interaction inputs. It must not assign player position, health, ammunition, objective state or invulnerability to pass a route. Record inspection-camera captures separately. Extend QA when map or mechanics change; old route success is not evidence for a new map.

Inspect actual gameplay frames and comparable baseline/model screenshots. Test real keyboard/mouse movement, aiming, pause and the new interaction. A complete automated route establishes reachability and rules, not human combat balance or proven fun. Record failures, fix them, and rerun affected cases.

For freight, test warehouse and container pickup, stairs in both directions, differing core orders, carrying fire/sprint restrictions, Q drop, heat/cooling recovery, loading/departure gates, both route choices, escort distance, damage/repair and reset. Use the DOM report to distinguish assertions that ran from planned steps.

Use **过热移动实测** for a complete thermal recovery under normal enemy pressure. It must reach automatic overheating with living enemies, prove that a reachable hot core rejects held interaction, cool naturally, recover the same core and load it. Death is a failed attempt that requires route/strategy repair and another run. Preserve normal enemy/damage settings and inspect the temperature/input trace; a cooling assertion cannot pass merely because the core was out of reach. See `scripts/verify_thermal.py` and the acceptance reference for recorded-evidence verification.

## Collision and combat regressions

- A guardrail is not a solid bullet wall. Separate player barriers from thin metal collision; diagonal rails require shape-aware rays, not their full bounding box. Player shots, enemy shots and AI line of sight must share that collision policy.
- Draw every opening from the same layout intervals used by collision. Add supported posts, connections and footings. Test both staircase landings and both directions; inspection cameras alone are insufficient.
- Validate actual input-fired shots through gaps from below and above, shots blocked by metal, and an input-driven attempt to walk through the guard. Keep numerical ray probes separate from these shot results.
- Validate recovery-phase reinforcements without loading or departure, plus cargo milestones and escort waves. Include a slower stationary run, offscreen spawn clearance, warning lead time, finite reserves, an alive cap, pause and reset. Winning two fast routes alone does not validate combat pacing.
- Publish per-artifact hashes and preserve earlier evidence as history. Never relabel old gameplay logs as tests of changed collision or combat code.

## Deliver

Provide HTML, recipe, complete Skill folder, screenshots, exact byte size and build SHA-256, gameplay evidence and honest limits. Include full source assets and scripts with the Skill; Markdown alone is insufficient. Development can be multi-file, but the export must be self-contained.

Do not infer universal performance or stability from one run. If `file://` or browser-offline cold starts are blocked, state that limit and report what was actually tested. Silent testing does not validate the sound mix.

Before public distribution, read the source-provenance note. The inherited game's whole-game open-source license is unverified; embedded Three.js MIT is not a license for all inherited code. Local authorized generation can proceed. Do not apply a blanket license or publish inherited assets without resolving provenance.

## Brand and provenance

Use **BigGamePage · 一页大作** and the exact tagline **Big games. One page.**. The Skill name is `big-game-page`; the runtime namespace is `BGP` / `window.BigGamePage`. Keep recipe game titles independent of the toolkit identity. Scene manufacturers use the fictional “一页” prefix. Retain source attribution and upstream license notices in `SOURCE-NOTICE.md` and `assets/THREE-LICENSE.txt`; changing visible branding does not transfer ownership.

For a naming-only revision, verify build determinism, no old visible branding, every game startup and input route, screenshot typography, model fidelity and unchanged gameplay logic. Preserve old evidence separately; each new run must include the exact current artifact hash.
