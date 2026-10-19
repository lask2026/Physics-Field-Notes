import {validateAnswer} from './validation.mjs';
import {fresh,readProgress,writeProgress,sanitize} from './progress.mjs';
import {escapeHtml as e} from './diagram.mjs';
import {learnView} from './learn.mjs';
import {practiceView,stageKey} from './practice.mjs';
const data=JSON.parse(document.getElementById('physics-data').textContent),assets=Object.fromEntries(data.assets.assets.map(a=>[a.id,a]));
let chapter=data.chapters[0];
const ids=new Set(data.chapters.flatMap(c=>c.exercises.flatMap(ex=>ex.stages.map(s=>stageKey(ex,s)))));
let storage;try{storage=window.localStorage;}catch{storage={getItem(){throw Error();},setItem(){throw Error();}};}
let loaded=readProgress(storage,ids),state=loaded.state,warning=loaded.warning,mode='learn',lesson=0,step=0,exercise=0,stage=0,chosen=[],feedback='';
const view=document.getElementById('view');
function current(){const ex=chapter.exercises[exercise],s=ex.stages[stage];return {ex,s,key:stageKey(ex,s)};}
function save(){warning=writeProgress(storage,state)||warning;}
function render(){const active=document.activeElement;const action=active?.closest('#view')?active.dataset.action:undefined;document.documentElement.dataset.theme=state.theme;document.documentElement.classList.toggle('no-motion',state.reduced);document.body.classList.toggle('dark',state.theme==='dark');
 document.getElementById('warning').textContent=warning;
 document.getElementById('theme').setAttribute('aria-pressed',state.theme==='dark');document.getElementById('motion').setAttribute('aria-pressed',state.reduced);
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-current',b.dataset.mode===mode?'page':'false'));
 const chapterIds=new Set(chapter.exercises.flatMap(ex=>ex.stages.map(s=>stageKey(ex,s))));const records=Object.entries(state.stages).filter(([id])=>chapterIds.has(id)).map(([,r])=>r);document.getElementById('progress').textContent=`${records.filter(r=>r.done&&!r.assisted).length} independent · ${records.filter(r=>r.done&&r.assisted).length} assisted / ${chapterIds.size} stages · ${chapter.title}`;
 document.getElementById('scope').textContent=chapter.scopeNote;
 view.innerHTML=mode==='learn'?learnView(chapter,assets,lesson,step,{motion:!state.reduced&&!matchMedia('(prefers-reduced-motion: reduce)').matches}):practiceView(chapter,assets,exercise,stage,state,chosen,feedback);
 if(action){const target=view.querySelector(`[data-action="${action}"]:not(:disabled)`);const fallback=view.querySelector(mode==='learn'?'.step':action==='practiceConcept'?'#question':'#feedback');const focus=target||fallback;if(focus){if(!target)focus.tabIndex=-1;focus.focus({preventScroll:true});}}
}
function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.addEventListener('click',async event=>{const b=event.target.closest('button,[data-explore-part],[data-select-part]');if(!b||b.disabled)return;
 if(b.dataset.explorePart){const next=chapter.lessons[lesson].steps.findIndex(s=>s.focus.includes(b.dataset.explorePart));if(next>=0){step=next;render();const part=view.querySelector(`[data-explore-part="${b.dataset.explorePart}"]`);part?.focus({preventScroll:true});}return;}
 if(b.dataset.action==='playVisual'||b.dataset.action==='replayVisual'){const figure=b.closest('.physics-figure');if(state.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches)return;if(b.dataset.action==='replayVisual'){figure.dataset.playing='true';void figure.offsetWidth;figure.getAnimations({subtree:true}).forEach(animation=>{animation.currentTime=0;});}else figure.dataset.playing=figure.dataset.playing==='true'?'false':'true';const control=figure.querySelector('[data-action=playVisual]');control.textContent=figure.dataset.playing==='true'?'Pause process':'Play process';control.setAttribute('aria-pressed',figure.dataset.playing);return;}
 if(b.dataset.mode){mode=b.dataset.mode;feedback='';chosen=[];}
 else if(b.dataset.lesson!==undefined){lesson=Number(b.dataset.lesson);step=0;}
 else if(b.dataset.exercise!==undefined){exercise=Number(b.dataset.exercise);stage=0;chosen=[];feedback='';}
 else if(b.dataset.node||b.dataset.selectPart){const id=b.dataset.node||b.dataset.selectPart;chosen=chosen.includes(id)?chosen.filter(n=>n!==id):[...chosen,id];const pressed=chosen.includes(id);b.setAttribute('aria-pressed',pressed);view.querySelectorAll('[data-node],[data-select-part]').forEach(el=>el.setAttribute('aria-pressed',chosen.includes(el.dataset.node||el.dataset.selectPart)));view.querySelectorAll('.entity').forEach((g,i)=>g.classList.toggle('selected',chosen.includes(assets[current().s.asset||current().ex.asset].nodes[i].id)));return;}
 else {const action=b.dataset.action;
 if(action==='practiceConcept'){const target=chapter.exercises.findIndex(ex=>ex.asset===chapter.lessons[lesson].asset);if(target<0)return;mode='practice';exercise=target;stage=0;chosen=[];feedback='';}
 else if(action==='next')step++;else if(action==='previous')step--;
 else if(action==='theme'){state.theme=state.theme==='dark'?'light':'dark';save();}
 else if(action==='motion'){state.reduced=!state.reduced;save();}
 else if(action==='hint'||action==='reveal'){const {key}=current(),r=state.stages[key]||{done:false,assisted:false,hints:0};r.assisted=true;if(action==='hint')r.hints=Math.min(r.hints+1,2);else r.done=true;state.stages[key]=r;save();}
 else if(action==='advance'){if(stage+1<current().ex.stages.length)stage++;else{const ex=current().ex;ex.stages.forEach(s=>delete state.stages[stageKey(ex,s)]);stage=0;save();}chosen=[];feedback='';}
 else if(action==='export'){download('physics-progress.json',JSON.stringify(state,null,2),'application/json');return;}
 else if(action==='reset'){if(!confirm('Reset all Physics progress and preferences?'))return;state=fresh();stage=0;chosen=[];feedback='';save();}
 else if(action==='save-app'){try{let html;if(location.protocol==='file:'){const root=document.documentElement.cloneNode(true);root.querySelector('#view').innerHTML='';html='<!doctype html>\n'+root.outerHTML;}else{const r=await fetch('Physics-Field-Notes-offline.html');if(!r.ok)throw Error();html=await r.text();}download('Physics-Field-Notes-offline.html',html,'text/html');}catch{warning='Download unavailable. Use the standalone HTML supplied with this build.';} }
 else return;}
 render();
});
document.addEventListener('submit',event=>{if(event.target.id!=='answer-form')return;event.preventDefault();const {s,key}=current(),form=event.target;
 const value=s.type==='selection'?chosen:s.type==='choice'?(form.querySelector(':checked')?Number(form.querySelector(':checked').value):null):form.elements.answer.value;
 if(validateAnswer(s,value)){state.stages[key]={done:true,assisted:state.stages[key]?.assisted===true,hints:state.stages[key]?.hints||0};save();feedback='';}else feedback='Not correct yet. Reconsider the mechanism, or use a hint.';render();const message=document.getElementById('feedback');message.tabIndex=-1;message.focus({preventScroll:true});
});
document.getElementById('import').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>200000)throw Error('Progress file exceeds 200 KB.');state=sanitize(JSON.parse(await file.text()),ids);stage=0;chosen=[];feedback='';save();warning='Progress imported.';}catch(error){warning='Import rejected: '+error.message;}event.target.value='';render();});
document.getElementById('catalog').addEventListener('change',event=>{const next=data.chapters.find(c=>c.id===event.target.value);if(!next)return;chapter=next;lesson=0;step=0;exercise=0;stage=0;chosen=[];feedback='';render();view.focus({preventScroll:true});});
document.getElementById('catalog').innerHTML=data.catalog.chapters.map(c=>`<option value="${c.id}" ${c.status==='planned'?'disabled':''}>${c.number}. ${e(c.title)}${c.status==='planned'?' — planned':c.status==='pilot'?' — pilot':''}</option>`).join('');
render();

document.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-explore-part],[data-select-part]')){event.preventDefault();event.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
