export const storageKey='physics-field-notes-v1';
export function fresh(){return {version:1,subject:'physics',theme:'light',reduced:false,stages:{}};}
export function sanitize(value,validIds){
 if(!value||value.version!==1||value.subject!=='physics'||!value.stages||typeof value.stages!=='object'||Array.isArray(value.stages))throw Error('Not a Physics progress file.');
 const out=fresh();out.theme=value.theme==='dark'?'dark':'light';out.reduced=value.reduced===true;
 for(const [key,state] of Object.entries(value.stages)){if(!validIds.has(key)||!state||typeof state!=='object')continue;
 if(!Number.isInteger(state.hints)||state.hints<0||state.hints>2||typeof state.done!=='boolean'||typeof state.assisted!=='boolean')continue;
 const hints=state.hints;
 const assisted=state.assisted===true||hints>0;
 out.stages[key]={done:state.done===true,assisted,hints};}
 return out;
}
export function readProgress(storage,ids){try{const raw=storage.getItem(storageKey);return {state:raw?sanitize(JSON.parse(raw),ids):fresh(),warning:''};}catch{return {state:fresh(),warning:'Saved progress could not be read. The application remains usable.'};}}
export function writeProgress(storage,state){try{storage.setItem(storageKey,JSON.stringify(state));return '';}catch{return 'Progress could not be saved on this device. Keep an exported copy.';}}
