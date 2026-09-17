import {mkdir, copyFile, rm, writeFile, lstat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {siteFiles} from './site-files.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.join(root,'dist');
for(const file of siteFiles){const info=await lstat(path.join(root,file));if(!info.isFile()||info.isSymbolicLink())throw Error('Expected regular source file: '+file)}
await rm(output,{recursive:true,force:true});
for(const file of siteFiles){const destination=path.join(output,file);await mkdir(path.dirname(destination),{recursive:true});await copyFile(path.join(root,file),destination)}
await writeFile(path.join(output,'.nojekyll'),'');
console.log(`Built ${siteFiles.length+1} public files in dist/. No dependencies or bundler needed.`);
