import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {projectPath} from '../../project-layout.mjs';import {physicalSvg} from '../../dev/src/visuals.mjs';import {diagram} from '../../dev/src/diagram.mjs';import {chapters,blindCases} from '../../review/scripts/packets.mjs';
const assets=JSON.parse(fs.readFileSync(projectPath('content','assets.json')));test('all 55 physical assets have unique original renderable illustrations and stable entities',()=>{assert.equal(assets.assets.length,55);const pictures=new Set();for(const a of assets.assets){assert(a.visual?.type);const svg=physicalSvg(a);assert(svg);assert.equal((svg.match(/data-part=/g)||[]).length,4);assert(!/undefined|NaN|<animate|<image|https?:\/\//.test(svg.replace('http://www.w3.org/2000/svg','')));for(const n of a.nodes)assert(svg.includes(`data-part="${n.id}"`));pictures.add(svg);assert(!diagram(a).includes('visual-controls'));}assert.equal(pictures.size,55);});
test('practice and blind visual views have no focus, playback controls or solution overlays',()=>{for(const c of chapters()){for(const ex of c.exercises){assert(/^ph-\d{2}-\d{2}-workshop-v1$/.test(ex.id));}for(const row of blindCases(c,assets)){assert(row.diagram.visual);assert(row.diagram.originalSvg);assert(!/class="[^"]*\bfocus\b/.test(row.diagram.originalSvg));assert(!row.diagram.originalSvg.includes('selected'));assert(!row.diagram.originalSvg.includes('visual-controls'));}}});
test('motion controls only accompany models with genuine process animation',()=>{for(const a of assets.assets){const staticView=diagram(a,[],false,[],true,false),movingView=diagram(a,[],false,[],true,true);assert(staticView.includes('data-playing="false"'));if(movingView.includes('visual-controls')){assert(movingView.includes('Pause process'));assert(staticView.includes('disabled'));}else assert(!movingView.includes('Pause process'));}});

test('canonical Physics text retains UTF-8 symbols without mojibake',()=>{for(const name of fs.readdirSync(projectPath('content')).filter(n=>n.endsWith('.json')))assert(!/Ã|Â|â€|â†|�/.test(fs.readFileSync(projectPath('content',name),'utf8')),name);});

test('blind SVG access labels do not restore stripped author titles',()=>{const modified=structuredClone(assets);for(const a of modified.assets)a.title='AUTHOR_TITLE_SENTINEL';for(const c of chapters())assert(!JSON.stringify(blindCases(c,modified)).includes('AUTHOR_TITLE_SENTINEL'));});

test('all 216 structured teaching cards render safely and stay out of blind inputs',async()=>{const {teachingCards}=await import('../../dev/src/learn.mjs');const titles=new Set();let count=0;for(const ch of chapters()){for(const lesson of ch.lessons){const html=teachingCards(lesson);assert.equal((html.match(/<details /g)||[]).length,4);assert.equal((html.match(/ open>/g)||[]).length,1);for(const key of ['coreRule','memoryCue','traps','application']){const c=lesson[key];assert(c.title.trim());assert(!titles.has(c.title),'Distinct concept hook: '+c.title);titles.add(c.title);assert(c.paragraphs.length>=2);assert(new Set(c.paragraphs).size===c.paragraphs.length);count++;}const attack=structuredClone(lesson);attack.coreRule.title='<script>CARD_TITLE_SENTINEL</script>';attack.coreRule.paragraphs=['<img src=x onerror=alert(1)>','CARD_BODY_SENTINEL'];const safe=teachingCards(attack);assert(!safe.includes('<script>'));assert(!safe.includes('<img'));assert(safe.includes('&lt;script&gt;'));const changed=structuredClone(ch);changed.lessons=[attack];assert(!JSON.stringify(blindCases(changed,assets)).includes('CARD_BODY_SENTINEL'));}}assert.equal(count,216);});


test('converging-lens artwork satisfies its thin-lens geometry and magnification',()=>{
 const asset=assets.assets.find(a=>a.id==='ph08-02'),svg=physicalSvg(asset);
 const parallel=svg.match(/d="M([0-9.]+) ([0-9.]+) H([0-9.]+) L([0-9.]+) ([0-9.]+)"/);
 assert(parallel,'Parallel incident ray must be represented');
 const [,xo,yo,xl,xi,yi]=parallel.map(Number),axis=200;
 const crossing=xl+(axis-yo)*(xi-xl)/(yi-yo),f=crossing-xl,objectDistance=xl-xo,imageDistance=xi-xl;
 assert(f>0&&objectDistance>f&&imageDistance>0);
 assert(Math.abs(1/f-1/objectDistance-1/imageDistance)<1e-12);
 assert(Math.abs((yi-axis)/(yo-axis)+imageDistance/objectDistance)<1e-12);
 assert(Math.abs(yo+(xl-xo)*(yi-yo)/(xi-xo)-axis)<1e-12);
 assert(svg.includes(`cx="${crossing}" cy="${axis}" r="5"`),'Focal marker must match the refracted parallel ray');
});
