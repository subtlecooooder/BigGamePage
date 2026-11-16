#!/usr/bin/env python3
"""Verify recorded browser-input evidence against the exact exported HTML."""
import argparse
import hashlib
import json
import math
from pathlib import Path


def verify(game, evidence, proof=None):
    raw = game.read_bytes()
    r = json.loads(evidence.read_text())
    digest = hashlib.sha256(raw).hexdigest()
    assert len(raw) < 2_000_000
    assert digest == r['artifact']['sha256']
    if proof is not None:
        p = json.loads(proof.read_text())
        assert digest == p['afterArtifactSHA256']
        assert p['byteIdenticalOutsideQA'] and p['recipeUnchanged']
        assert all(v['unchanged'] for v in p['modules'].values())
    assert not r['running'] and r['mission']['state'] == 'paused'
    assert not r['errors'] and not r['networkResources']
    assert r['audioContext'] == 'stub' and not r['invulnerableDuringPlay']
    assert not r['inspectionCamera'] and not r['waypointProblems']
    assert r['geometry']['dog']['hash'] == '56cdfa8c'
    assert r['geometry']['drone']['hash'] == 'aabcf30a'
    assert all(c['pass'] for c in r['checks'])
    checks = {c['name']: c for c in r['checks']}
    for name in ['automatic-overheat-drop', 'hot-core-rejects-held-E',
                 'dropped-core-cools-naturally', 'cooled-core-repicked-with-E',
                 'same-core-loaded-after-thermal-cycle', 'overheat-with-enemies-alive']:
        assert checks[name]['pass'], name
    hot = checks['hot-core-rejects-held-E']
    assert hot['heatStart'] > .65 and hot['heatEnd'] > .65
    assert hot['heldSeconds'] >= 1 and hot['reachableEveryFrame']
    assert hot['distance'] < 2.65 and hot['lineOfSight']
    cool = checks['dropped-core-cools-naturally']
    assert .085 < cool['rate'] < .095 and cool['heatEnd'] <= .60
    repick = checks['cooled-core-repicked-with-E']
    assert repick['heatBefore'] <= .65
    assert repick['pickupsAfter'] == repick['pickupsBefore'] + 1
    assert checks['overheat-with-enemies-alive']['alive'] > 0
    m = r['mission']
    assert m['loaded'] == ['W'] and m['overheats'] == 1
    assert 0 < m['minHP'] < 100 and m['playerHealth'] > 0
    assert m['combat']['shots'] > 0 and m['combat']['kills'] > 0
    events = m['events']
    # Extra resupply is conditional on combat pressure, not a thermal rule.
    # Verify the initial real use and its event count without requiring wasteful repeats.
    supply_events = [e for e in events if e['event'] == 'supply']
    assert m['supplyUses'] >= 1 and m['supplyUses'] == len(supply_events), 'supply count does not match actual interactions'
    assert m['director']['maxObserved'] <= 6
    release = next(e for e in events if e['event'] == 'overheat-drop' and e['core'] == 'W')
    pickup = next(e for e in events if e['event'] == 'pickup' and e['core'] == 'W' and e['time'] > release['time'])
    loaded = next(e for e in events if e['event'] == 'load' and e['core'] == 'W' and e['time'] > pickup['time'])
    assert release['time'] < pickup['time'] < loaded['time']
    trace = r['thermalTrace']
    assert len(trace) > 100 and not any(t['invulnerable'] for t in trace)
    for a, b in zip(trace, trace[1:]):
        dt = b['time'] - a['time']
        assert 0 < dt < 1
        if a['state'] == b['state'] == 'carried':
            assert abs(b['heat'] - a['heat'] - dt / 55) < .001
        if a['state'] == b['state'] == 'dropped' and a['overheats'] == b['overheats']:
            assert abs(b['heat'] - max(0, a['heat'] - dt * .09)) < .001
    moving = [t for t in trace if t.get('stage') == 'thermal-soak']
    travel = sum(math.dist(a['player'], b['player']) for a, b in zip(moving, moving[1:]))
    stalled = maximum_stall = 0
    for a, b in zip(moving, moving[1:]):
        if (a['state'] == b['state'] == 'carried' and a['mode'] == b['mode'] == 'carry'
                and math.dist(a['player'], b['player']) < .025):
            stalled += b['time'] - a['time']
            maximum_stall = max(maximum_stall, stalled)
        else:
            stalled = 0
    assert travel > 60 and maximum_stall < 1, 'moving route obstructed'
    return {'pass': True, 'sha256': digest, 'bytes': len(raw),
            'overheatAt': release['time'], 'repickedAt': pickup['time'],
            'loadedAt': loaded['time'], 'aliveAtOverheat': checks['overheat-with-enemies-alive']['alive'],
            'minHP': m['minHP'], 'supplies': m['supplyUses'],
            'travelDuringThermalStage': round(travel, 2),
            'longestStationaryCarrySampleSeconds': maximum_stall,
            'checks': r['checks'], 'frameTiming': r['frameTiming'],
            'viewport': r['viewport'], 'drawingBuffer': r['render']['res']}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--game', required=True, type=Path)
    parser.add_argument('--evidence', required=True, type=Path)
    parser.add_argument('--proof', type=Path, help='Optional proof for a QA-only code revision; not required for a fresh full browser run.')
    parser.add_argument('--out', type=Path)
    args = parser.parse_args()
    result = verify(args.game, args.evidence, args.proof)
    output = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    if args.out:
        args.out.write_text(output)
    print(output)
