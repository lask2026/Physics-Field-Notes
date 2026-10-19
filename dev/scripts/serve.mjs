import {projectRoot} from '../../project-layout.mjs';
process.chdir(projectRoot);
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const root=path.resolve('dist');const port=Number(process.env.PORT||4173);
const server=http.createServer((req,res)=>{try{const f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==root&&!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}const file=f===root?path.join(root,'index.html'):f;res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end('Not found');}});server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
