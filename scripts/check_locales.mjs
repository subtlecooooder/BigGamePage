#!/usr/bin/env node
// Exercise the shipped language resolver and translator without a DOM or dependencies.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const asset = new URL('../skills/big-game-page/assets/', import.meta.url);
const source = fs.readFileSync(new URL('runtime/i18n.js', asset), 'utf8');
const dictionary = fs.readFileSync(new URL('locales/en.json', asset), 'utf8');
const split = '  const app = document.getElementById(\'app\');';
assert.equal(source.split(split).length, 2, 'Pure translation boundary must remain explicit');
function engine(recipe, {languages=['en-US'], stored=null, query='', storageThrows=false}={}) {
  const prefix = source.split(split)[0].replace('/* BIGGAMEPAGE_EN */', dictionary);
  const context = {BGP:{recipe},URLSearchParams,location:{search:query},navigator:{languages,language:languages[0]},localStorage:{getItem(){if(storageThrows)throw Error('Blocked storage');return stored;}}};
  vm.runInNewContext(prefix + '\n globalThis.result={translate,browserLanguage,language,preference,storageAvailable,missing};})();', context);
  return context.result;
}
let cases=0;
for(const name of ['switchyard-zero','night-harbor','selene-repair','bunker-09']) {
  const recipe=JSON.parse(fs.readFileSync(new URL(`recipes/${name}.json`,asset),'utf8'));
  for(const [options,language,preference] of [
    [{languages:['zh-CN']},'zh','auto'],
    [{languages:['zh-TW','en-US']},'zh','auto'],
    [{languages:['en-GB','zh-CN']},'en','auto'],
    [{languages:['fr-FR','de-DE']},'en','auto'],
    [{languages:['zh-CN'],stored:'en'},'en','en'],
    [{languages:['en-US'],stored:'zh',query:'?lang=en'},'en','en'],
    [{languages:['zh-CN'],stored:'en',query:'?lang=auto'},'zh','auto'],
    [{languages:['zh-CN'],stored:'broken',query:'?lang=invalid'},'zh','auto'],
    [{languages:['en-US'],storageThrows:true},'en','auto'],
  ]) {const r=engine(recipe,options);assert.equal(r.language,language);assert.equal(r.preference,preference);cases++;}
  const en=engine(recipe),zh=engine(recipe,{languages:['zh-CN']});
  for(const [original,translated] of [[recipe.title,recipe.locales.en.title],[recipe.brief,recipe.locales.en.brief],...recipe.objectives.map((text,index)=>[text,recipe.locales.en.objectives[index]])]) {
    assert.equal(en.translate(original),translated);assert.equal(zh.translate(original),original);cases++;
  }
  assert.equal(en.translate('北极未知符号'),'北极未知符号','Unknown names must not be translated character by character');
  assert.equal(en.translate('30米'),'30 m');
  assert.equal(en.translate(null),null);
  assert.equal(en.translate('A · Disable yard alarm'),'A · Disable yard alarm');
}
const r=engine(JSON.parse(fs.readFileSync(new URL('recipes/switchyard-zero.json',asset),'utf8')));
for(const text of ['按住 E · 磁吸搬运 西库 / 稳压核心','按住 E · 核心冷却中','第 4 波增援抵达','装载 2/3 · 西线','维修包 2 · 备用弹药 150','警戒 3 波 · 在场 5 · 回收守备余量 8','核心温度 84% · Q 放下','护送开始 · 保持距车 8 米以内','N ↑ / M 展开','已根据设备自动选择画质（高），运行不流畅时可降低画质。','一页九式突击步枪','Q 放下后战斗 · 警戒第 2 波','64 秒 · 7 台守卫 · 补给 2 次','最高警戒 100% · 暴露 4 次']) {
  assert.doesNotMatch(r.translate(text),/[\u3400-\u9fff]/,text);cases++;
}
console.log(`PASS: ${cases} locale selection, bilingual recipe and dynamic-message cases; no browser or external packages`);
