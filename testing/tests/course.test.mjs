import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {projectPath} from '../../project-layout.mjs';import {chapters,blindCases} from '../../review/scripts/packets.mjs';import {validateAnswer} from '../../dev/src/validation.mjs';
const all=chapters(),catalog=JSON.parse(fs.readFileSync(projectPath('content','catalog.json'))),assets=JSON.parse(fs.readFileSync(projectPath('content','assets.json'))),byId=Object.fromEntries(assets.assets.map(a=>[a.id,a]));
const ids=new Set();for(const ch of all)test(ch.id+': coverage, unique assessment identity, valid highlights, keys and blind packet',()=>{const outline=catalog.chapters.find(c=>c.id===ch.id);assert(outline);assert.equal(ch.title,outline.title);assert.deepEqual(new Set(ch.lessons.map(l=>l.section)),new Set(outline.sections.map(s=>s.id)));assert(ch.lessons.length>=outline.sections.length);const lessonIds=new Set();for(const l of ch.lessons){assert(!lessonIds.has(l.id));lessonIds.add(l.id);assert(byId[l.asset]);assert(l.steps.length>=3);for(const step of l.steps)for(const id of step.focus)assert(byId[l.asset].nodes.some(n=>n.id===id));for(const key of ['coreRule','memoryCue','traps','application']){const card=l[key];assert(card.title.length>=8);assert(card.paragraphs.length>=2);assert(card.paragraphs.every(p=>p.length>=20));}assert(ch.exercises.some(ex=>ex.asset===l.asset),'Each lesson must map to a practice concept');}
for(const ex of ch.exercises){assert(!ids.has(ex.id),'Cross-chapter collision: '+ex.id);ids.add(ex.id);const stageIds=new Set();assert(byId[ex.asset]);assert(ex.stages.length>=3);for(const s of ex.stages){assert(!stageIds.has(s.id));stageIds.add(s.id);assert(validateAnswer(s,s.answer));assert(!validateAnswer(s,s.type==='choice'?-1:s.type==='selection'?[]:'garbage'));assert.equal(s.hints.length,2);assert(s.hints[0]!==s.hints[1]);assert(s.explanation.length>25);const a=byId[s.asset||ex.asset];assert(a);if(s.type==='selection')for(const id of s.answer)assert(a.nodes.some(n=>n.id===id));}}
const blind=blindCases(ch,assets);assert.equal(blind.length,ch.exercises.reduce((n,e)=>n+e.stages.length,0));for(const row of blind){assert(!Object.hasOwn(row,'answer'));assert(!Object.hasOwn(row,'hints'));assert(!Object.hasOwn(row,'explanation'));}});
test('independent dimensional and numerical spot checks across the physics outline',()=>{
 const s=(ch,section,n)=>all[ch-1].exercises[section-1].stages[n];
 const near=(ch,section,n,value)=>{const stage=s(ch,section,n);assert.equal(stage.type,'number');assert(Math.abs(stage.answer-value)<=Math.max(1e-12,Math.abs(value)*1e-12));};
 near(1,1,2,3*(1/100)**2);near(1,2,1,Math.hypot(6,8));near(1,3,1,(10-(-2))/4);near(1,4,1,12/3);near(1,6,1,0.5*2*3**2);near(1,6,2,-10);near(1,7,1,12*0.5);
 near(2,1,1,0.5*2*3**2);near(2,2,2,240/6);near(2,3,2,75/100);
 near(3,3,1,500-180);near(3,3,2,0-(-70));near(3,4,1,600/300);
 near(4,2,1,1000*10*2);near(4,2,2,1000*10*0.003);near(4,3,1,6*2/3);near(4,3,2,2**4);
 near(5,2,1,36/3**2);near(5,3,1,-12);near(5,4,1,3*(-4));near(5,6,1,2*3*0.5);
 near(6,2,2,1/(1/6+1/3));near(6,3,1,4*3);near(6,3,2,0.5*2*3**2);
 near(7,1,1,5*2);near(7,2,2,10*Math.log10(100));near(8,1,1,3e8/6e-7);near(8,2,1,1/(1/10-1/30));near(8,2,2,-15/30);near(8,4,2,80*Math.cos(Math.PI/3)**2);
 near(9,3,1,0.020*931.5);near(9,4,1,800*0.5**3);
 near(10,2,2,2e3*3e-2);near(12,1,1,(2+4+6+8)/4);near(12,3,1,12/Math.sqrt(36));near(12,4,2,0.12/0.30);near(12,5,1,1-0.20);near(12,6,1,(14-2)/(5-1));near(12,7,1,(0.02-0.01)/0.02);
});
