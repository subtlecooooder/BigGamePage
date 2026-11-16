#!/usr/bin/env python3
"""Deterministic, offline build. Python standard library only."""
from pathlib import Path
import argparse, hashlib, json, re
from html.parser import HTMLParser
from html import escape

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'assets'
MODULES=['adapter','devices','climbing','worlds','qa','missions']

def validate_recipe(r):
    for key in ['id','title','subtitle','world','brief','objectives','mechanics','palette']:
        if key not in r: raise ValueError('Missing recipe field: '+key)
    for key in ['id','title','subtitle','world','brief']:
        if not isinstance(r[key],str) or not r[key].strip(): raise ValueError('Expected nonempty text: '+key)
    if not isinstance(r['objectives'],list) or not isinstance(r['palette'],list) or not isinstance(r['mechanics'],dict): raise ValueError('Invalid recipe collection types')
    if not re.fullmatch(r'[a-z][a-z0-9-]{2,40}',r['id']): raise ValueError('Invalid id')
    if r['world'] not in ('harbor','moon','bunker','freight'): raise ValueError('Unsupported world')
    if len(r['objectives'])!=3: raise ValueError('This baseline supports exactly three authored objectives')
    if any(not isinstance(x,str) or not x for x in r['objectives']): raise ValueError('Invalid objectives')
    if len(r['palette'])!=3 or any(not isinstance(s,str) or not re.fullmatch(r'#[0-9a-fA-F]{6}',s) for s in r['palette']): raise ValueError('Invalid palette')
    for key in ['reserve','startReserve']:
        value=r['mechanics'].get(key)
        if type(value) is not int or not 0<=value<=300: raise ValueError('Invalid ammunition budget: '+key)
    if r['mechanics']['startReserve']>r['mechanics']['reserve']: raise ValueError('Starting reserve exceeds supply capacity')
    if r['world']=='freight':
        for key,lo,hi in [('carrySeconds',20,180),('cartHealth',1,300),('repairKits',0,10)]:
            value=r['mechanics'].get(key)
            if type(value) not in (int,float) or not lo<=value<=hi: raise ValueError('Invalid freight rule: '+key)
        if type(r['mechanics']['repairKits']) is not int: raise ValueError('repairKits must be an integer')
    if '<' in ''.join(str(r.get(x,'')) for x in ['title','subtitle','brief']): raise ValueError('HTML is not allowed in recipe copy')

class Resources(HTMLParser):
    def __init__(self): super().__init__(); self.external=[]; self.scripts=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='script': self.scripts+=1
        for k in ['src','srcset','poster']+(['href'] if tag=='link' else []):
            if a.get(k) and not a[k].startswith(('data:','blob:','#')): self.external.append((tag,k,a[k]))

def js_text(value):
    """Safe text inside either quoted or template literals in the pinned menu."""
    special='"\'`\\$\n\r\u2028\u2029'
    return ''.join('\\u%04x'%ord(c) if c in special else c for c in value)

def build(recipe,out):
    r=json.loads(Path(recipe).read_text()); validate_recipe(r)
    manifest=json.loads((ASSETS/'foundation-manifest.json').read_text())
    base=(ASSETS/'runtime/foundation.js').read_bytes()
    if hashlib.sha256(base).hexdigest()!=manifest['foundation_sha256']: raise ValueError('Pinned foundation changed; review and re-baseline before building')
    modules=['adapter','freight-map','freight-game','freight-qa'] if r['world']=='freight' else MODULES
    module='\n'.join((ASSETS/f'runtime/{name}.js').read_text() for name in modules)
    assert base.count(b'/* BIGGAMEPAGE_MODULES */')==1
    js=base.decode().replace('/* BIGGAMEPAGE_MODULES */',module)
    # Menu copy is a presentation adapter; never edit geometry to apply a theme.
    js=js.replace('<h1 class="m-word">一页<span class="m-subtitle">3A大作</span></h1>',f'<h1 class="m-word">{js_text(r["title"])}<span class="m-subtitle">{js_text(r["subtitle"])}</span></h1>')
    for before,after in {'一页港区':r['title'],'一页突击小队':'BigGamePage · 一页大作','国产第一人称射击游戏':'独立单文件游戏','港区主控':'自动防御系统'}.items(): js=js.replace(before,js_text(after))
    js=js.replace('<kbd>E</kbd> 切断中继','<kbd>E</kbd> 任务 / 补给 / 设备').replace('已切断中继','已完成作业')
    js=js.replace('四号泊位',{'harbor':'04 号货运港','moon':'月面货运基地','bunker':'地下第九层','freight':'环形货运枢纽'}[r['world']])
    js=js.replace('05:42',{'harbor':'02:17','moon':'EVA / 07','bunker':'B09 / LOCKDOWN','freight':'NODE 00 / 18:40'}[r['world']])
    about=js.find('<h3>BigGamePage · 一页大作</h3>')
    if about>=0:
        end=js.index('</div>',about)
        js=js[:about]+f'<h3>{js_text(r["title"])} / BigGamePage · 一页大作</h3><p>{js_text(r["brief"])}</p><p>Big games. One page.</p><p>精细机器狗、无人机、可进入仓库和集装箱，全部封装于单个 HTML。继承素材来源及许可边界见随包 SOURCE-NOTICE.md。</p><p>补给、门控与终端：按住 E。梯子：E 抓取，W / S 上下，E 或空格松手。地底九号：L 手电。</p>'+js[end:]
    if r['world']=='freight':
        js=js.replace('补给、门控与终端：按住 E。梯子：E 抓取，W / S 上下，E 或空格松手。地底九号：L 手电。','按住 E 搬运、装车、选线和修车；Q 放下核心，M 展开地图。楼梯可直接步行。')
    shell=(ASSETS/'shell.html').read_text()
    shell=re.sub(r'<title>.*?</title>',lambda _:f'<title>{escape(r["title"])} · BigGamePage · 一页大作</title>',shell,count=1)
    css=(ASSETS/'runtime/style.css').read_text()+f'\n:root{{--signal:{r["palette"][0]};--bgp-accent:{r["palette"][0]};--bgp-glow:{r["palette"][1]};}}'
    if r['world']=='freight': css+='\n'+(ASSETS/'runtime/freight-style.css').read_text()
    shell=shell.replace('/* BIGGAMEPAGE_STYLE */',css)
    encoded=json.dumps(r,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
    shell=shell.replace('<!-- BIGGAMEPAGE_SCRIPT -->','<script>\nwindow.BIGGAMEPAGE_RECIPE='+encoded+';\n'+js+'\n</script>')
    # Network access is denied at runtime too; the inline engine, textures and audio are self-contained.
    csp="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; connect-src 'none'; worker-src blob:; base-uri 'none'; form-action 'none'"
    shell=shell.replace('<head>','<head>\n<meta http-equiv="Content-Security-Policy" content="'+csp+'">\n<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 64 64\'%3E%3Crect width=\'64\' height=\'64\' rx=\'14\' fill=\'%230c1c28\'/%3E%3Cpath d=\'M16 10h23l9 9v35H16Z M37 10v12h11 M24 31h16 M24 40h12\' fill=\'none\' stroke=\'%237cddce\' stroke-width=\'4\' stroke-linejoin=\'round\'/%3E%3C/svg%3E">',1)
    license_text=(ASSETS/'THREE-LICENSE.txt').read_text()
    shell=shell.replace('<script>\n', '<script>\n/* Three.js r180 - '+license_text+' */\n', 1)
    raw=shell.encode(); audit=Resources(); audit.feed(shell)
    if len(raw)>=2_000_000: raise ValueError(f'Over budget: {len(raw)} bytes')
    if audit.external: raise ValueError('External resources: '+str(audit.external))
    if audit.scripts!=1: raise ValueError('Expected exactly one inline script')
    for u in re.findall(r'url\(\s*[\"\']?([^\)\"\']+)',css):
        if not u.startswith(('data:','#')): raise ValueError('External CSS url: '+u)
    out=Path(out); out.parent.mkdir(parents=True,exist_ok=True); out.write_bytes(raw)
    info={'id':r['id'],'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'budget':2_000_000,'externalHTMLResources':audit.external,'runtimeNetworkPolicy':'connect-src none','foundation_sha256':manifest['foundation_sha256'],'brand':'BigGamePage · 一页大作','tagline':'Big games. One page.','version':'0.3.0'}
    out.with_suffix('.build.json').write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n')
    return info

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--recipe',required=True,type=Path);p.add_argument('--out',required=True,type=Path)
    args=p.parse_args();print(json.dumps(build(args.recipe,args.out),ensure_ascii=False))
