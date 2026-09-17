import http from 'node:http';
import {readFile, realpath} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {siteFiles} from './scripts/site-files.mjs';
const projectRoot=fileURLToPath(new URL('.',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8'};
const allowed=new Set([...siteFiles,'.nojekyll','tests/smoke.html']);
export function createStaticServer({root=projectRoot,base='/'}={}){
  if(!base.startsWith('/')||!base.endsWith('/')||base.includes('..'))throw Error('Base must start and end with /');
  return http.createServer(async(req,res)=>{
    try{
      if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});return res.end()}
      let pathname;
      try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);return res.end('Bad path')}
      if(!pathname.startsWith(base)){res.writeHead(404);return res.end('Not found')}
      let relative=pathname.slice(base.length);if(relative.endsWith('/')||!relative)relative+='index.html';
      if(!allowed.has(relative)){res.writeHead(404);return res.end('Not found')}
      const file=await realpath(path.join(root,relative)),rootReal=await realpath(root),within=path.relative(rootReal,file);
      if(within.startsWith('..')||path.isAbsolute(within)){res.writeHead(403);return res.end('Forbidden')}
      const data=await readFile(file);
      res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':data.length,'X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});
      res.end(req.method==='HEAD'?undefined:data);
    }catch{res.writeHead(404);res.end('Not found')}
  });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2),arg=(name,fallback)=>{const i=args.indexOf(name);if(i<0)return fallback;if(!args[i+1]||args[i+1].startsWith('--'))throw Error('Missing '+name+' value');return args[i+1]};
  const host=arg('--host','127.0.0.1'),port=Number(arg('--port','8787')),base=arg('--base','/'),root=path.resolve(projectRoot,arg('--root','.'));
  if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid port');
  const server=createStaticServer({root,base});
  server.on('error',error=>{console.error(`Cannot start server: ${error.message}`);process.exitCode=1});
  server.listen(port,host,()=>console.log(`Migration Studio → http://${host}:${server.address().port}${base}`));
}
