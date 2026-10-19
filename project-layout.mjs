import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const projectRoot=path.dirname(fileURLToPath(import.meta.url));
export const projectLayout=JSON.parse(fs.readFileSync(path.join(projectRoot,'project-layout.json'),'utf8'));
if(projectLayout.version!==1||!projectLayout.subject?.id||!projectLayout.paths)throw Error('Invalid project layout manifest');

export function projectPath(key,...parts){
  const relative=projectLayout.paths[key];
  if(typeof relative!=='string'||path.isAbsolute(relative))throw Error('Unknown or absolute project path: '+key);
  const base=path.resolve(projectRoot,relative),resolved=path.resolve(base,...parts);
  if(!base.startsWith(projectRoot+path.sep)||(resolved!==base&&!resolved.startsWith(base+path.sep)))throw Error('Project path escapes its declared folder');
  return resolved;
}
for(const key of Object.keys(projectLayout.paths))projectPath(key);
