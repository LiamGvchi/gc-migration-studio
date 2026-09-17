import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createStaticServer} from '../serve.mjs';
import {siteFiles} from '../scripts/site-files.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
async function allFiles(dir,prefix=''){let result=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=prefix+e.name;if(e.isDirectory())result.push(...await allFiles(path.join(dir,e.name),p+'/'));else result.push(p)}return result.sort()}
async function withServer(options,fn){const server=createStaticServer(options);await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});try{await fn('http://127.0.0.1:'+server.address().port)}finally{server.closeAllConnections();await new Promise(r=>server.close(r))}}
await test('public build contains only the release allowlist',async()=>{
  const run=spawnSync(process.execPath,['scripts/build.mjs'],{cwd:root,encoding:'utf8'});assert.equal(run.status,0,run.stderr);
  assert.deepEqual(await allFiles(path.join(root,'dist')),[...siteFiles,'.nojekyll'].sort());
  for(const file of siteFiles)assert.deepEqual(await readFile(path.join(root,file)),await readFile(path.join(root,'dist',file)),file);
});
await test('GitHub project path serves every relative runtime asset',async()=>{
  await withServer({root:path.join(root,'dist'),base:'/migration-studio/'},async origin=>{
    for(const file of ['index.html','preview.html',...siteFiles.filter(f=>f.startsWith('assets/'))]){const response=await fetch(origin+'/migration-studio/'+file);assert.equal(response.status,200,file);assert((await response.arrayBuffer()).byteLength>0,file)}
    const index=await fetch(origin+'/migration-studio/');assert.match(await index.text(),/视觉候鸟/);
    assert.equal((await fetch(origin+'/migration-studio/assets/app.js',{method:'HEAD'})).status,200);
  });
});
await test('development server never serves repository metadata or user exports',async()=>{
  await withServer({root},async origin=>{
    for(const file of ['.git/config','.env','package.json','docs/PUBLISH.md','uploads/photo.jpg','migration-studio-project.json','%2e%2e%2fREADME.md'])assert.equal((await fetch(origin+'/'+file)).status,404,file);
    assert.equal((await fetch(origin+'/index.html',{method:'POST'})).status,405);
    assert.equal((await fetch(origin+'/tests/smoke.html')).status,200);
  });
});
