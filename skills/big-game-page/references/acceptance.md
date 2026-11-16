# Acceptance evidence

1. Build twice and compare SHA-256. Parse JavaScript syntax. Verify each final HTML is strictly below 2,000,000 bytes and has one inline script, no external HTML/CSS resource references. Runtime CSP denies network fetches.
2. Run each final artifact, including a local `file://` check where the browser supports it. Record actual runtime resources and JS/shader errors. An HTTP-served self-contained file with denied connections establishes no remote dependency; do not mislabel it as a browser-offline-mode test.
3. Run the input-only full route. Require `state=complete`, objectives=3, supplies used, both EMPs used, shutter closure and no invulnerability during active play. Check the event log, not the bot's planned route.
4. Confirm the open container and warehouse positions were physically reached. Photograph both. Count preservation and exact geometry comparisons supplement screenshots, never replace them.
5. Check mission-specific mechanics with direct input or a dedicated visible QA route. Ordered objectives must reject B before A. Bunker B must reject a missing fuse. Verify pickup and consumption. Oxygen must decline, sprinting must consume more, and resupply must restore it. Test low-gravity jump/landing and inspect the trajectory. Reset must clear all per-run state.
6. After gravity or collision changes, traverse all crane ladders/stairs using input controls; require summit reached at y=30.34 and safe return. A camera above the roof is not climbing evidence.
7. Take yard and warehouse screenshots at identical camera/FOV/quality and viewport for baseline and all themes. Photograph machine dog and drone at the same model-showcase view. Inspect silhouettes, joints, texture detail, occlusion, interior props, lighting and visibility.
8. Try real browser movement/look/crouch/fire/reload/pause. Input bots can validate reachability and rules but not subjective aiming feel or player skill. Record human-style observations separately, without claiming user testing.
9. Record FPS/frame quantiles only for active runs, with resolution and quality. Do not extrapolate a single-machine measurement to all devices. Inspect final screenshot composition before delivery.

Publish evidence as screenshots plus JSON logs and an honest concise report. Any unexecuted case is explicitly unverified. Skill frontmatter validation only checks packaging; it does not verify game quality.

QA mode is silent by default. For normal-menu testing, hide the panel with H first so its overlay does not intercept the start button on short viewports. This overlay is absent without `?qa=1`. For matching screenshots, explicitly fix the viewport only for the comparison, then restore it. Do not compare FPS across different drawing-buffer sizes.

Run `python3 scripts/validate_package.py` for a dependency-free packaging check. It intentionally supports this kit's simple single-line frontmatter. The host skill creator's generic validator may additionally be run when PyYAML is available; report its absence rather than treating an import failure as a pass.

## Independent-level acceptance (v0.2)

The legacy relay/EMP/crane checks above apply to legacy levels only. For a new level, replace them with its own route and rule cases; retain size, dependency, geometry fidelity, screenshot, real-input and honest-report requirements.

For freight, require physically reached warehouse/container cores and both stairways; full delivery with three cargo items and no invulnerability; a second core order and chosen route; carry fire denial, dropping and reheating/cooling; early departure denial; escort stop outside range; line-of-sight damage and finite-kit repair; restart resets all per-run state. Missing cases remain unverified until executed. Match frame-quality settings and label inspection cameras. Compare layout topology as well as material/asset detail. Do not claim all new genres are stable based on this one archetype.

## Freight regression acceptance (v0.2.1)

Run the visible **护栏弹道与防跌落实测** and **回收阶段驻守实测**. Require actual upward/downward gap shots, a metal hit, and no walking through the upper guard; numerical physics probes must also pass but are not a substitute for weapon inputs. Traverse the upper ring's corners and both stairs. Recover from the service well after adding structural collision.

The stationary case must trigger at least two recovery waves with zero loaded cores and no departure. Every spawned unit must have a clear spawn body, be at least 18 m away and outside unobstructed forward view; warnings precede spawning by at least 6 s. Require alive cap <= 6, recovery reserve <= 12, and pause/reset cancellation. Full deliveries need new logs for both core orders/routes, including damage and repair. Count and inspect detailed rigs again.

Capture stair supports at matching before/after camera settings. State quality, drawing-buffer resolution and measured frame times; do not reuse old performance numbers for changed builds.

The thermal follow-up replaces the exposed wait in **搬运规则实测** with input-driven defence/recovery and adds **过热移动实测**. The latter must overheat while enemies are still alive, reject a held E while the dropped core is both reachable and hotter than 65%, cool naturally, repick the same core with E, and load it. Keep normal enemies, damage, ammunition, 55-second heating and 9%-per-second cooling. If the player dies, fix the input route/strategy and rerun; do not remove enemies, grant health/invulnerability, or count an attempted sequence as passed.

Record the full temperature/input/health trace and exact artifact SHA. Check that repeated pickups refer to the same core, heat falls at the normal rate, damage occurred, and the moving route did not just remain stuck against a vehicle. The corrected circuit crosses at z=24.8 to clear the parked cart. These thermal routes pause only after all assertions and final loading finish. Other finite QA routes still need an explicit pause when their driver stops.

Additional medical resupply depends on actual combat pressure. Verify at least one real supply use and exact agreement between the supply counter and recorded interactions; do not require a second use just because an earlier run needed one. Retain every heat, damage, live-enemy, reachability and movement assertion.

From the complete BigGamePage bundle, validate the saved final run with:

```sh
python3 skill/big-game-page/scripts/verify_thermal.py --game games/零号中转站.html --evidence evidence/rebrand/freight-thermal.json
```

This checks actual browser records, not a mocked thermal model. The thermal follow-up completed the previously missing heat/cool/recovery coverage; keep earlier failed runs as history and do not relabel them with a newer file hash.
