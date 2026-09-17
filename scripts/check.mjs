import {readFile, readdir, stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {siteFiles} from './site-files.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
let count=0;
for(const folder of ['assets','scripts','tests','.']){
  for(const name of await readdir(path.join(root,folder))){
    if(!/\.(mjs|js)$/.test(name))continue;
    const file=path.join(root,folder,name),run=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
    assert.equal(run.status,0,run.stderr);count++;
  }
}
for(const name of ['index.html','preview.html','tests/smoke.html']){
  const html=await readFile(path.join(root,name),'utf8');
  assert(!html.includes('/Users/')&&!html.includes('file:///'),'Machine-specific path: '+name);
  for(const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/\bsrc\s*=/.test(script[1]))new vm.Script(script[2],{filename:name});
  for(const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)){
    const ref=match[1];if(/^(?:https?:|blob:|data:|#)/.test(ref))continue;
    assert(!ref.startsWith('/'),'Absolute URL breaks repository Pages path: '+ref);
    const location=path.resolve(root,path.dirname(name),ref.split(/[?#]/)[0]);
    assert(!path.relative(root,location).startsWith('..'),'Reference outside repository: '+ref);
    await stat(location);
  }
}
for(const file of siteFiles){assert((await stat(path.join(root,file))).isFile(),'Missing site file: '+file)}
const emoji=await readFile(path.join(root,'assets/emoji-data.js'),'utf8');
assert(emoji.includes('UNICODE LICENSE V3'),'Unicode notice missing');
const catalog=JSON.parse(emoji.split('const EMOJI_CATALOG=')[1].trim().replace(/;$/,''));
assert.equal(catalog.entries.length,3953);
for(const file of ['.github/workflows/pages.yml','.github/workflows/ci.yml','docs/PUBLISH.md','THIRD_PARTY_NOTICES.md'])await stat(path.join(root,file));
console.log(`PASS: ${count} JS files, inline scripts, local references, ${siteFiles.length} site files, 3,953 Emoji entries.`);
