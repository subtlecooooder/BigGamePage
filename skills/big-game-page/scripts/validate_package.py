#!/usr/bin/env python3
"""Validate this kit's deliberately simple, single-line skill frontmatter and files."""
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
s=(ROOT/'SKILL.md').read_text()
assert s.startswith('---\n'), 'Missing frontmatter'
head=s.split('---',2)[1].strip().splitlines()
fields={}
for line in head:
    key,sep,value=line.partition(':')
    assert sep and key in ('name','description'), 'Unsupported metadata form'
    fields[key]=value.strip()
assert fields['name']=='big-game-page'
assert 20<len(fields['description'])<=1024
assert not any(x in fields['description'] for x in ['<','>','[TODO'])
for path in re.findall(r'`((?:references|scripts|assets)/[^`<> ]+)`',s):
    assert (ROOT/path).exists(), 'Missing '+path
for file in ['assets/shell.html','assets/foundation-manifest.json','assets/THREE-LICENSE.txt','SOURCE-NOTICE.md','agents/openai.yaml']:
    assert (ROOT/file).is_file()
from build import validate_recipe, MODULES
for name in MODULES+['freight-map','freight-game','freight-qa']: assert (ROOT/f'assets/runtime/{name}.js').is_file()
recipes=list((ROOT/'assets/recipes').glob('*.json'))
assert len(recipes)==4
for recipe in recipes:validate_recipe(json.loads(recipe.read_text()))
assert '$big-game-page' in (ROOT/'agents/openai.yaml').read_text()
assert 'BigGamePage · 一页大作' in s and 'Big games. One page.' in s
assert 'BigGamePage · 一页大作' in (ROOT/'agents/openai.yaml').read_text()
assert 'Copyright © 2010-2025 three.js authors' in (ROOT/'assets/THREE-LICENSE.txt').read_text()
print('PASS: strict single-line frontmatter, references, runtime modules, agent metadata and four recipes')
