# Architecture

`assets/runtime/foundation.js` is the original inline Three.js r180 and game engine, with audited crane hatch/cage corrections, per-recipe settings storage, weather-aware weapon wetness and one module insertion marker. The original asset generators and static layout remain untouched. `assets/foundation-manifest.json` pins its SHA-256 and records baseline geometry and provenance; the detailed original extraction log remains in the pre-branding archive.

`adapter.js` maps the inherited private factory symbols to `BGP` hooks. Future core revisions must update this one boundary, recheck counts and rerun all acceptance routes. This is a deliberate adapter around a mature monolith, not a claim that the whole original engine has been rewritten into a general engine.

`devices.js` extracts supply cabinets, EMP devices and animated warehouse shutter from the earlier RED DUNE adaptation. `climbing.js` supplies stair collision and three continuous ladder paths. They still use inherited internal symbols and are treated as pinned legacy adapters, not public extension APIs.

`worlds.js` provides harbor weather and lights, lunar regolith/solar cells/habitat modules/dishes/Earth, and the enclosed 40 m underground freight cavern with overhead trusses, ducts and service lighting. It preserves the original layout in all worlds.

`missions.js` provides ordered objective gates, mission text, enemy sensing policy, alarm, oxygen, the fuse pickup/consumption, flashlight battery, supply effects and reset behavior. It decorates the original mission controller; underlying gun combat and three-terminal extraction remain common.

`qa.js` is an opt-in visible test panel. A path planner produces movement inputs and an aim controller produces mouse deltas. It writes no player position/health/ammunition or mission progression. Inspection-camera buttons use the original screenshot API and are logged separately. Diagnostics are rendered in `#bgp-report` for browser DOM readout. Performance samples exclude initial warmup and paused frames.

`scripts/build.py` uses only Python's standard library. It validates recipes, enforces the pinned foundation, assembles all code and CSS into the HTML, applies presentation copy, checks resources/size and writes the manifest. Games use a Content Security Policy denying network connections. Their procedural textures and synthesized audio are generated locally.

Development files are intentionally readable and modular. Exported files have no sibling-file dependency. Legacy adaptations embed their three world kits; independent archetypes select their own modules. Aggressive minification is unnecessary within the current budget.

The intended public extension interface is `BGP.recipe`, `BGP.wrap(factory, decorator)`, `BGP.T`, `BGP.V`, `BGP.merge`, `BGP.bevel`, and documented movement/sensing/mission settings. Run initialization follows render → materials → level → backdrop → ground → audio/player/weapon/enemies/HUD → game. Install theme geometry in backdrop and rule state in game.

## Independent maps and controllers (v0.2)

For `world=freight`, the builder selects `adapter`, `freight-map`, `freight-game`, `freight-qa` and `freight-style.css`, instead of the legacy map decorators and relay controller. The original level and mission functions remain in the pinned engine but are not called by this archetype.

`BGP.configureMap` sets world bounds and navigation dimensions before physics construction. `BGP.layoutContext`, `BGP.warehouse` and the original props factory provide detailed assets independently of the original level placement. Warehouse geometry, colliders, interior volumes, labels, lights and animated fans must all be transformed together; moving just the render group is incorrect.

`freight-map.js` owns a square freight hub, central well, elevated pedestrian ring/crossbridge, two warehouse wings, container depots and ground transport routes. Mesh batching and label atlasing retain high detail. `freight-game.js` owns unordered core recovery, physical carrying/dropping, overheating/cooling, cart loading, route selection, proximity escort, enemy line-of-sight cart damage, repairs and delivery/failure. It reuses gun and enemy behavior, not the legacy three-relay controller.

`freight-qa.js` renders `#ft-report`. Its input driver uses the level's ground navigation and authored elevated waypoints; it does not teleport across stairs. It logs checks against actual mission events and full enemy geometry hashes. Inspection cameras are explicitly separate from playable traversal.

### Freight collision and reinforcement ownership (v0.2.1)

`freight-map` wraps physics raycast with finite metal-cylinder intersections. Player-only guard volumes remain impassable; shots and sight pass empty gaps. Shared rail intervals create visual and collision openings. Support columns and service-well walls have solids.

`freight-game` owns a finite reinforcement director: a 32 s initial patrol alarm, pickup-triggered alarms, 6 s warnings, a 26 s minimum recovery interval, twelve recovery reinforcements and six live enemies maximum. Three escort checkpoints queue additional warned waves. Offscreen entry clearance is checked both when warning and spawning; changed entries restart the warning. Pause stops mission time; restart clears director queues, wave counters and minimap state.
