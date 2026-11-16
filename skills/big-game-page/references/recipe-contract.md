# Recipe contract

Required: `id` (lowercase hyphenated), `title`, `subtitle`, `world` (`harbor`, `moon`, `bunker`, `freight`), `brief`, exactly three `objectives`, three hex colors in `palette`, and `mechanics` containing `startReserve` and `reserve`.

Version 0.4 also requires `locales.en` with a nonempty `title`, `brief`, and exactly three translated `objectives`. The main recipe copy is Chinese. Shared interface messages live in `assets/locales/en.json`; add translations there when introducing new prompts or mechanics. HTML markup is rejected in both language copies. Both languages are embedded in every export.

The game uses a supported `lang=zh|en|auto` query override, then a remembered manual preference, then the first supported language in `navigator.languages` (English fallback). The title/pause language selector updates immediately; choosing automatic clears the saved preference. A manual choice updates an existing URL override too, so reloading cannot unexpectedly revert it. Storage failures fall back to the current session.

Worlds are authored gameplay archetypes, not a free-text skin parser:

| World | Layout additions | Consequential rule |
|---|---|---|
| harbor | wet original harbor, lamps, overhead cables, route signs | narrow enemy sight cone; crouching reduces sight distance and delays detection; shooting raises alarm; high alarm blocks data access |
| moon | dry gray terrain, 6 solar arrays, 3 habitat modules, dishes, procedural Earth/stars | reduced gravity; oxygen drains faster when sprinting; repairs recover 12 oxygen; supplies restore oxygen |
| bunker | enclosed cavern, full-height trusses and pipes, airlock, emergency lamps | retrieve a fuse from the open container; required for objective B and consumed on use; toggle flashlight with L; battery replenishes at supplies |

These three legacy worlds share A→B→C→extraction, intact enemy models, combat, EMP, warehouse door, resupply and vertical routes. Three outputs validate those bounded combinations. A medieval RPG, driving game or new character anatomy requires new authored modules and new validation; changing a recipe's title will not provide it.

For a new legacy-layout adaptation, add the environment to `worlds.js`, define the state/reset/gating behavior in `missions.js`, extend allowed recipe values in the builder, author a valid route in `qa.js`, and record evidence. Never silently disable enemies or shrink the map to make validation pass.

Level coordinates: spawn (-32,0,6); supply 1 (-31.5,0,9.5); open red container around (-14.6,0,12.4); EMP 1 (-8.5,0,9.8); A (1.5,0,7.5); warehouse front (-3.5,0,-10.9); supply 2 (-10.2,0,-26.5); B is the inherited warehouse terminal; EMP 2 (15.2,0,-20); supply 3 (18.5,0,-15.8); C is the inherited east terminal; extraction (29,0,20). Read actual terminal positions at runtime instead of assuming coordinates.

Crane route: ground ladder bottom (19.8,0,7.35), first landing (20,3.6,6.56), six switchback flights, service deck y=21.9, roof ladder (25.2,21.9,3.55), roof y=26.12, final ladder (26.12,26.12,-.25), summit y=30.34. Lunar jump values are tuned for gameplay, not a scientific lunar-gravity simulator.

## Freight archetype (v0.2)

`world=freight` adds a fourth supported archetype. Its three `objectives` are phase descriptions, not ordered terminal gates. Required mechanic parameters: `startReserve`, `reserve`, `carrySeconds` (seconds to overheat), `cartHealth`, `repairKits`.

The map and mission are independent of harbor/moon/bunker. The three cores can be collected in any order. Carrying blocks fire and sprint, Q drops a recoverable core, heat forces a drop, three loaded cores unlock departure, the route console selects west/east, and the moving carrier requires nearby escort. Enemies damage the cart with unobstructed line of sight; finite repair kits recover it. Delivery at the north terminal wins; death or cart destruction loses.

For another independently authored game, add dedicated modules and select them in `build.py`; do not extend only `worlds.js` and rename legacy objectives. Specify the map plan, failure conditions, reset ownership, controls and input-only test route. The reusable warehouse/asset factory can be placed anywhere with correctly transformed colliders and interior metadata.
