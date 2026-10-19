(()=>{const __modules={};
__modules.validation=(()=>{
function validateAnswer(stage,value){
 if(stage.type==='choice')return Number.isInteger(value)&&value>=0&&value<stage.options.length&&value===stage.answer;
 if(stage.type==='selection')return Array.isArray(value)&&value.every(x=>typeof x==='string')&&new Set(value).size===value.length&&value.length===stage.answer.length&&stage.answer.every(x=>value.includes(x));
 if(stage.type==='text')return typeof value==='string'&&[stage.answer,...(stage.aliases||[])].some(x=>stage.caseSensitive===false?x.toLowerCase()===value.trim().toLowerCase():x===value.trim());
 if(stage.type==='number'){if(typeof value!=='string'&&typeof value!=='number')return false;const s=String(value).trim();return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(s)&&Number.isFinite(Number(s))&&Math.abs(Number(s)-stage.answer)<=(stage.tolerance||0);}
 return false;
}

return {validateAnswer};})();
__modules.progress=(()=>{
const storageKey='physics-field-notes-v1';
function fresh(){return {version:1,subject:'physics',theme:'light',reduced:false,stages:{}};}
function sanitize(value,validIds){
 if(!value||value.version!==1||value.subject!=='physics'||!value.stages||typeof value.stages!=='object'||Array.isArray(value.stages))throw Error('Not a Physics progress file.');
 const out=fresh();out.theme=value.theme==='dark'?'dark':'light';out.reduced=value.reduced===true;
 for(const [key,state] of Object.entries(value.stages)){if(!validIds.has(key)||!state||typeof state!=='object')continue;
 if(!Number.isInteger(state.hints)||state.hints<0||state.hints>2||typeof state.done!=='boolean'||typeof state.assisted!=='boolean')continue;
 const hints=state.hints;
 const assisted=state.assisted===true||hints>0;
 out.stages[key]={done:state.done===true,assisted,hints};}
 return out;
}
function readProgress(storage,ids){try{const raw=storage.getItem(storageKey);return {state:raw?sanitize(JSON.parse(raw),ids):fresh(),warning:''};}catch{return {state:fresh(),warning:'Saved progress could not be read. The application remains usable.'};}}
function writeProgress(storage,state){try{storage.setItem(storageKey,JSON.stringify(state));return '';}catch{return 'Progress could not be saved on this device. Keep an exported copy.';}}

return {storageKey,fresh,sanitize,readProgress,writeProgress};})();
__modules.visuals=(()=>{

// Original physics artwork. Coordinates, tracers and distributions are illustrative.
const colors=['blue','purple','green','gold'];
const color=i=>`var(--v-${colors[i%4]})`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function line(d,i=0,extra=''){return `<path class="outline ${extra}" d="${d}" fill="none" stroke="${color(i)}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;}
function rect(x,y,w,h,i=0){return `<rect class="outline" x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${color(i)}" fill-opacity=".1" stroke="${color(i)}" stroke-width="3"/>`;}
function circle(x,y,r,i=0){return `<circle class="outline" cx="${x}" cy="${y}" r="${r}" fill="${color(i)}" fill-opacity=".12" stroke="${color(i)}" stroke-width="3"/>`;}
function arrow(d,i=0,flow=false){return (flow?`<path class="outline" d="${d}" fill="none" stroke="${color(i)}" stroke-opacity=".2" stroke-width="4" marker-end="url(#physics-arrow)"/>`:"")+`<path class="${flow?'flow':'outline'}" d="${d}" fill="none" stroke="${color(i)}" stroke-width="4" marker-end="url(#physics-arrow)"/>`;}
function note(x,y,t){return `<text class="anatomy-note" x="${x}" y="${y}" text-anchor="middle">${esc(t)}</text>`;}
function resistor(x,y,i=2){return line(`M${x-50} ${y} h15 l7 -12 14 24 14 -24 14 24 7 -12 h15`,i);}
function graph(){return line('M100 70 V300 H550',0)+note(320,360,'Schematic axes; see the lesson for variables and units');}
function cards(){return [rect(90,85,175,75,0),rect(375,85,175,75,1),rect(90,245,175,75,2),rect(375,245,175,75,3)];}
function scene(type){const p=[[160,55],[480,55],[160,370],[480,370]];const standard={positions:p};
 switch(type){
 case 'units':return {...standard,parts:[rect(95,105,110,90)+note(150,155,'kg'),line('M375 150 H545 M375 135 V165 M545 135 V165',1)+note(460,125,'m'),circle(150,275,40,2)+line('M150 275 V250 M150 275 L175 285',2)+note(150,338,'s'),rect(400,240,120,70,3)+note(460,282,'N · J · Pa')],base:note(320,205,'Dimensions combine; conversions preserve the quantity')};
 case 'vectors':return {...standard,parts:[arrow('M170 270 H470',0),arrow('M470 270 V115',1),arrow('M170 270 L470 115',2),line('M110 300 H540 M140 325 V85',3)],positions:[[310,320],[550,205],[280,150],[115,65]],base:note(320,395,'Arrow lengths are illustrative, not problem values')};
 case 'motion':return {...standard,parts:[circle(140,180,18,0),circle(490,180,18,1),arrow('M160 150 H470',2),line('M140 200 C210 320 390 310 490 200',3)],positions:[[140,100],[490,100],[320,120],[320,350]],base:line('M90 215 H550',0)+note(320,390,'Endpoints define displacement; the route defines distance')};
 case 'forces':return {parts:[arrow('M320 205 V310',0),arrow('M320 165 V70',1),arrow('M360 185 H520',2),arrow('M280 185 H160',3)],positions:[[390,315],[395,80],[510,150],[150,150]],base:rect(280,165,80,42)+line('M100 210 H550',0)+note(320,365,'Forces on one block · arrow lengths are qualitative')};
 case 'kinematics':return {...standard,parts:[arrow('M120 130 H230',0),arrow('M320 130 H490',1),circle(150,275,35,2)+line('M150 275 V250 L170 270',2),arrow('M290 275 H510',3)],base:circle(110,130,14)+circle(290,275,14,3)+note(320,205,'One axis, signed quantities, constant acceleration')};
 case 'torque':return {parts:[line('M245 265 L285 205 L325 265Z',0),line('M285 225 H485 M285 210 V240 M485 210 V240',1),arrow('M485 95 V200',2),arrow('M365 125 Q410 135 400 180',3)],positions:[[205,310],[385,275],[520,75],[355,95]],base:line('M110 205 H530',0)+note(320,370,'Torque uses perpendicular distance to the line of action')};
 case 'energy':return {...standard,parts:[circle(160,125,20)+arrow('M195 125 H250',0),circle(460,105,20,1)+line('M400 165 H520 M460 130 V160',1),arrow('M115 280 q20 -25 40 0 t40 0',2),rect(365,220,185,115,3)],base:note(320,200,'Energy forms and accounting boundary · no measured values')};
 case 'work':return {...standard,parts:[arrow('M150 190 L310 105',0),arrow('M150 190 H490',1),line('M205 190 Q205 176 198 164',2)+note(218,178,'θ'),rect(410,235,100,65,3)+note(460,275,'J / s')],positions:[[260,70],[450,150],[180,275],[460,345]],base:circle(150,190,14)+note(320,390,'Only the force component along displacement does work')};
 case 'pulley':return {...standard,parts:[arrow('M160 180 V295',0),line('M120 160 V300',1),rect(410,235,100,60,2)+arrow('M460 230 V175',2),arrow('M535 300 V220',3)],base:circle(310,115,42)+line('M268 115 V170 H160 M352 115 V220 H460',0)+line('M250 60 H370',0)+note(320,395,'Illustrative ideal machine: compare input and output work')};
 case 'temperature':return {...standard,parts:[rect(105,110,100,100)+note(155,165,'A'),line('M210 165 H430',1),rect(435,110,100,100,2)+note(485,165,'B'),circle(320,295,20,3)+rect(312,220,16,75,3)],base:note(320,355,'Equilibrium temperature; no heat-flow direction assumed')};
 case 'system':return {parts:[circle(320,190,62,0),rect(200,75,240,230,1).replace(/fill="[^"]+"/,'fill="none"'),line('M70 100 H155 M485 100 H570 M70 280 H155 M485 280 H570',2),arrow('M100 190 H230',3)],positions:[[320,190],[320,55],[100,65],[100,155]],base:note(320,365,'Classify matter and energy transfers across a chosen boundary')};
 case 'piston':return {...standard,parts:[arrow('M100 215 H220',0),arrow('M440 160 H550',1),Array.from({length:8},(_,i)=>circle(255+(i%4)*35,190+Math.floor(i/4)*50,5,2)).join(''),rect(400,130,28,150,3)],base:line('M235 125 V285 H430 M235 125 H430',0)+note(320,345,'Convention: heat into gas positive; work by gas positive')};
 case 'entropy':return {...standard,parts:[rect(100,100,100,90,0)+note(150,152,'ΔSsys'),rect(430,100,110,90,1)+note(485,152,'ΔSsurr'),rect(235,235,170,70,2)+note(320,277,'ΔStotal'),arrow('M220 145 H410',3)],positions:[[150,65],[485,65],[320,350],[320,110]],base:note(320,395,'Total entropy applies to the specified combined system')};
 case 'fluid':return {...standard,parts:[rect(110,100,100,85,0),line('M390 125 H530 M390 165 H530',1)+arrow('M410 145 H510',1),rect(110,250,100,70,2)+note(160,290,'m / V'),line('M390 250 H530 M390 310 H530',3)+line('M410 300 L500 260',3)],base:note(320,210,'Material properties are distinct; no density–viscosity equivalence')};
 case 'hydrostatic':return {parts:[line('M145 95 H495',0),arrow('M430 110 V240',1),circle(320,245,13,2)+arrow('M400 245 H350',2),arrow('M250 250 V170',3)],positions:[[320,65],[510,180],[395,295],[150,170]],base:line('M130 80 V330 H510 V80',0)+`<path d="M135 100 H505 V325 H135Z" fill="${color(0)}" fill-opacity=".08"/>`+rect(215,190,70,60,3)+note(320,385,'Uniform static fluid · qualitative depth and pressure')};
 case 'flow':return {parts:[line('M90 110 H225 M90 280 H225',0),line('M390 165 H550 M390 225 H550',1),arrow('M260 195 H500',2,true),circle(160,195,22,3)],positions:[[150,75],[465,130],[420,295],[155,325]],base:line('M225 110 L390 165 M225 280 L390 225',0)+note(320,375,'Steady incompressible flow model; tracers indicate flow direction')};
 case 'circulation':return {...standard,parts:[arrow('M110 110 H230',0),resistor(470,130,1),arrow('M100 280 H230',2,true),line('M370 265 H410 L450 235 H535 M410 265 L450 300 H535',3)],base:note(320,205,'Lumped pressure–resistance model and branching flow')};
 case 'charge':return {...standard,parts:[circle(160,130,35,0)+note(160,137,'+'),circle(480,130,35,1)+note(480,137,'−'),circle(160,285,38,2)+note(160,292,'+  −'),arrow('M390 285 H540',3)],base:note(320,205,'Charge signs and redistribution; circles are conceptual bodies')};
 case 'coulomb':return {parts:[circle(150,170,30,0)+note(150,177,'+'),circle(490,170,24,1)+note(490,177,'+'),line('M150 250 H490 M150 240 V260 M490 240 V260',2),arrow('M520 170 H585',3)],positions:[[150,100],[490,100],[320,295],[535,220]],base:note(320,365,'Like-sign example; magnitudes depend on stated charges and r')};
 case 'electric-energy':return {...standard,parts:[circle(160,140,30)+note(160,147,'+'),circle(480,140,25,1)+note(480,147,'−'),line('M190 195 H455 M190 185 V205 M455 185 V205',2),rect(240,260,160,55,3)+note(320,295,'Configuration U')],positions:[[160,75],[480,75],[320,235],[320,365]],base:note(320,400,'Zero energy at infinite separation in the stated point-charge model')};
 case 'potential':return {...standard,parts:[line('M150 95 V300',0),line('M490 95 V300',1),arrow('M200 170 H435',2),circle(320,250,18,3)+note(320,256,'q')],positions:[[150,65],[490,65],[320,135],[320,310]],base:note(320,370,'Uniform electric field points from higher to lower potential')};
 case 'conductor':return {parts:[circle(320,200,110,0),circle(320,200,55,1),line('M175 90 Q320 55 465 90',2),[-1,1].map(z=>note(320+z*105,200,'+')).join('')+note(320,95,'+')+note(320,310,'+')],positions:[[155,65],[320,205],[480,65],[480,345]],base:note(320,385,'Conducting material at electrostatic equilibrium; no internal cavity charge')};
 case 'magnet':return {parts:[Array.from({length:8},(_,i)=>{const x=150+(i%4)*105,y=110+Math.floor(i/4)*120;return line(`M${x-5} ${y-5} l10 10 m0 -10 l-10 10`,0);}).join(''),arrow('M300 190 H465',1),arrow('M300 190 V85',2),circle(300,190,20,3)+note(300,198,'+')],positions:[[155,65],[475,190],[370,80],[300,315]],base:note(320,375,'Positive charge moving right in field into page: force upward')};
 case 'circuit':return {parts:[line('M130 170 V210 M110 180 H150 M120 195 H140',0),arrow('M180 110 H400',1,true),resistor(470,190,2),line('M130 215 V300 H470 V220',3)],positions:[[90,160],[290,65],[535,195],[320,350]],base:line('M130 165 V110 H470 V165',0)+note(320,395,'Conventional current around an ideal closed loop')};
 case 'resistors':return {parts:[line('M90 170 V220 M70 185 H110 M80 205 H100',0),resistor(240,110,1),resistor(440,110,2),line('M90 225 V300 H550 V110 H495',3)],positions:[[90,140],[245,70],[440,70],[320,345]],base:line('M90 165 V110 H185 M295 110 H385',0)+note(320,390,'Two displayed resistors in series; prompt may ask a separate network')};
 case 'parallel-resistors':return {parts:[line('M90 175 V225 M70 190 H110 M80 210 H100',0),resistor(390,160,1),resistor(390,260,2),line('M90 170 V80 H240 V260 M240 160 H335 M240 260 H335 M445 160 H540 V340 H90 V230 M445 260 H540',3)],positions:[[95,155],[390,120],[390,310],[540,390]],base:note(320,425,'Both resistors connect across the same two nodes')};
 case 'capacitor':return {parts:[line('M240 95 V300',0)+note(220,195,'+'),line('M400 95 V300',1)+note(420,195,'−'),rect(275,115,90,165,2),Array.from({length:3},(_,i)=>arrow(`M255 ${145+i*55} H385`,3)).join('')],positions:[[170,65],[470,65],[320,330],[490,350]],base:note(320,395,'Ideal parallel plates; field stores energy; charge signs shown')};
 case 'meters':return {...standard,parts:[circle(175,130,30,0)+note(175,137,'A'),circle(470,130,30,1)+note(470,137,'V'),line('M100 255 H240 M100 300 H240',2),resistor(470,280,3)],base:note(320,205,'Symbols identify meter roles; connect according to the current prompt')};
 case 'wave':return {parts:[circle(160,135,10,0),circle(320,255,10,1),line('M160 90 H480 M160 80 V100 M480 80 V100',2),line('M550 195 V135 M540 195 H560 M540 135 H560',3)],positions:[[160,125],[320,285],[320,65],[550,125]],base:line('M70 195 H585',0)+line('M80 195 C100 195 140 135 160 135 S220 195 240 195 S300 255 320 255 S380 195 400 195 S460 135 480 135 S540 195 560 195',0)+arrow('M180 335 H470',2,true)+note(320,385,'Tracer arrow: phase propagation, not a material-particle path')};
 case 'sound':return {...standard,parts:[Array.from({length:7},(_,i)=>line(`M${130+i*5} 130 V245`,0)).join(''),Array.from({length:3},(_,i)=>line(`M${390+i*35} 130 V245`,1)).join(''),arrow('M180 295 H500',2,true),circle(100,200,22,3)+arrow('M75 265 H130',3)],positions:[[155,95],[460,95],[340,350],[100,330]],base:note(320,395,'Longitudinal pressure pattern; particles oscillate locally')};
 case 'spectrum':return {...standard,parts:[line('M70 170 q35 -55 70 0 t70 0',0),line('M245 170 q15 -45 30 0 t30 0 t30 0',1),line('M390 170 q7 -35 14 0 t14 0 t14 0 t14 0 t14 0 t14 0 t14 0',2),arrow('M110 285 H540',3)],positions:[[140,100],[295,100],[475,100],[320,345]],base:note(320,220,'Wavelength decreases across this illustrative vacuum ordering')};
 case 'optics':return {parts:[line('M320 70 V315 M310 85 L320 70 L330 85 M310 300 L320 315 L330 300',0),circle(400,200,5,1),arrow('M80 200 V110',2),arrow('M440 200 V245',3)],positions:[[320,45],[400,285],[100,75],[490,330]],base:line('M80 200 H580',0)+arrow('M80 110 H320 L440 245',2,true)+arrow('M80 110 L440 245',1)+note(320,380,'Qualitative converging-lens rays; dimensions are not problem distances')};
 case 'diffraction':return {...standard,parts:[line('M220 70 V160 M220 230 V320',0),[0,1,2].map(i=>line(`M${105+i*28} 115 V275`,1)).join(''),line('M550 180 V210',2),line('M550 70 V330',3)],positions:[[220,45],[130,90],[465,185],[550,365]],base:[0,1,2].map(i=>line(`M${260+i*75} ${155-i*30} Q${325+i*80} 195 ${260+i*75} ${235+i*30}`,1)).join('')+note(320,395,'Single opening and qualitative spread; screen marks are illustrative')};
 case 'polarization':return {...standard,parts:[arrow('M80 190 H195',0,true),circle(255,190,52,1)+line('M255 140 V240',1),circle(410,190,52,2)+line('M385 235 L435 145',2),arrow('M465 190 H565',3,true)],positions:[[135,125],[240,80],[420,80],[525,270]],base:note(320,355,'Transmission axes shown; intensity depends on the stated angles')};
 case 'photoelectric':return {...standard,parts:[arrow('M100 110 L245 215',0,true),line('M265 130 V300 M280 130 V300',1),circle(400,160,9,2)+arrow('M300 210 L435 135',2,true),rect(420,260,110,55,3)+note(475,295,'hf ≥ φ')],positions:[[130,70],[200,330],[450,100],[475,355]],base:note(320,395,'Above-threshold illustration; no measured emission rate')};
 case 'levels':return {parts:[line('M150 290 H490',0),line('M150 115 H490',1),arrow('M230 270 V135',2),arrow('M410 135 V270',3)],positions:[[125,330],[125,75],[150,200],[490,200]],base:note(320,370,'Allowed level gaps determine photon energies; rates not encoded')};
 case 'nucleus':return {...standard,parts:[[[110,130],[155,115],[190,145]].map(([x,y])=>circle(x,y,12,0)).join(''),[[440,130],[460,145],[480,125],[455,105]].map(([x,y])=>circle(x,y,12,1)).join(''),line('M110 270 H210 M110 255 V285 M210 255 V285',2)+note(160,315,'Δm'),rect(400,250,130,65,3)+note(465,290,'Δm c²')],base:note(320,205,'Nucleons are illustrative; no particular isotope is depicted')};
 case 'decay':return {...standard,parts:[circle(155,140,40,0),circle(320,220,12,1)+arrow('M210 165 L290 205',1),circle(480,140,32,2),line('M105 275 H250 M105 270 V305 M250 270 V305',3)+note(175,325,'t½')],base:arrow('M215 135 H420',2)+note(320,385,'Generic decay relationship, not a specific balanced isotope equation')};
 case 'precision':return {...standard,parts:[rect(95,105,120,70,0)+note(155,140,'0.00450'),line('M125 160 H190',1)+note(460,140,'4  5  0'),rect(85,250,140,70,2)+note(155,285,'12.3 + 0.45'),rect(400,250,135,65,3)+note(465,290,'Report')],base:note(320,210,'Examples of notation, not hidden assessment solutions')};
 case 'logarithm':return {...standard,parts:[rect(105,105,100,65,0)+note(155,140,'10ˣ'),rect(420,105,100,65,1)+note(470,140,'x'),rect(105,250,100,65,2)+note(155,285,'log₁₀'),line('M390 285 H540 M400 275 V295 M445 275 V295 M490 275 V295 M535 275 V295',3)],base:note(320,205,'Logarithmic spacing represents equal ratios')};
 case 'triangle':return {parts:[line('M470 290 V110',0),line('M150 290 H470',1),line('M150 290 L470 110',2),line('M210 290 Q210 270 202 260',3)+note(225,278,'θ')],positions:[[535,200],[325,345],[290,160],[150,235]],base:line('M450 290 V270 H470',0)+note(320,395,'Reference angle at lower left; lengths are qualitative')};
 case 'center':return {...standard,parts:[line('M100 135 H220',0)+note(160,110,'Σx / n'),line('M400 135 H530',1)+circle(465,135,8,1),circle(140,285,8,2)+circle(160,285,8,2)+circle(180,285,8,2),circle(500,285,8,3)],base:note(320,205,'Location summaries and an extreme observation')};
 case 'distribution':return {parts:[line('M100 290 Q155 290 200 245',0),line('M200 245 Q320 5 440 245',1),line('M440 245 Q490 290 550 290',2),`<path class="outline" d="M260 290 V155 Q320 95 380 155 V290Z" fill="${color(3)}" fill-opacity=".12" stroke="${color(3)}"/>`],positions:[[145,335],[320,65],[495,335],[320,375]],base:line('M80 290 H570',0)+note(320,410,'Schematic density only; no measured values or exact normal quantiles')};
 case 'spread':return {...standard,parts:[rect(110,105,100,65,0)+note(160,145,'s²'),rect(420,105,100,65,1)+note(470,145,'s'),rect(110,255,100,65,2)+note(160,295,'SE'),[0,1,2,3,4].map(i=>circle(420+i*20,285,5,3)).join('')],base:note(320,210,'Observation spread differs from uncertainty in an estimated mean')};
 case 'probability':return {parts:[circle(250,190,90,0),circle(390,190,90,1),`<path class="outline" d="M320 134 Q360 190 320 246 Q280 190 320 134Z" fill="${color(2)}" fill-opacity=".2" stroke="${color(2)}"/>`,rect(130,65,380,255,3).replace(/fill="[^"]+"/,'fill="none"')],positions:[[220,175],[420,175],[320,365],[320,45]],base:note(320,405,'Overlapping events in a conceptual sample space; not area-proportional')};
 case 'testing':return {...standard,parts:[rect(100,85,110,70,0)+note(155,125,'H₀'),line('M400 160 H530',1)+circle(465,160,7,1),`<path class="outline" d="M440 290 L500 240 V290Z" fill="${color(2)}" fill-opacity=".15" stroke="${color(2)}"/>`,rect(95,250,145,65,3)+note(167,290,'Decision')],base:note(320,205,'Conceptual test workflow; no particular p-value or critical value')};
 case 'graph':return {parts:[line('M110 300 H550',0),line('M110 300 V70',1),[0,1,2,3].map(i=>circle(190+i*85,255-i*35,5,2)).join(''),[0,1,2,3].map(i=>line(`M${190+i*85} ${235-i*35} v40 m-10 -40 h20 m-20 40 h20`,3)).join('')],positions:[[320,355],[95,45],[340,105],[510,210]],base:note(320,400,'Hypothetical visual pattern; actual uncertainty definition must be supplied')};
 case 'reasoning':return {...standard,parts:cards(),base:note(320,205,'Given information → model → computation → checks')};
 case 'research':return {...standard,parts:cards(),base:arrow('M275 125 H365',0)+arrow('M460 175 V225',1)+arrow('M365 285 H275',2)+arrow('M175 225 V175',3)};
 case 'experiment':return {...standard,parts:[rect(120,100,110,80,0)+note(175,147,'Manipulate'),rect(400,100,120,80,1)+note(460,147,'Measure'),rect(120,250,110,70,2)+note(175,292,'Compare'),circle(460,285,35,3)+note(460,292,'?')],base:note(320,210,'A controlled comparison requires identifiable experimental units')};
 case 'study':return {...standard,parts:[circle(320,95,25,0)+line('M320 120 L170 215 M320 120 L470 215',0),rect(105,225,130,65,1),rect(405,225,130,65,2),line('M210 330 H430',3)+note(320,355,'Assess without assignment cues')],positions:[[320,45],[170,320],[470,320],[320,400]]};
 case 'ethics':return {...standard,parts:[rect(115,100,100,80,0)+line('M130 120 H195 M130 140 H195',0),line('M460 100 V170 M420 170 H500 M420 120 H500',1),rect(125,250,80,65,2)+circle(165,280,12,2),[0,1,2].map(i=>circle(420+i*35,280,12,3)).join('')],base:note(320,210,'Principles for evaluating safeguards; not a legal checklist')};
 case 'translation':return {...standard,parts:[circle(155,135,30,0),circle(465,135,60,1),rect(100,250,110,70,2),arrow('M385 285 H540',3)],base:note(320,205,'Transfer from studied comparison to intended real-world use')};
 case 'inference':return {...standard,parts:[line('M115 155 L210 105',0),circle(465,135,30,1)+note(465,143,'?'),rect(105,250,110,65,2),rect(400,250,135,65,3)],base:note(320,205,'Association, alternative explanations and justified scope')};
 default:throw Error('Missing physics scene: '+type);
 }
}
function physicalSvg(asset,focus=[],chosen=[],standalone=false,interactive=false){
 const art=scene(asset.visual.type);
 const parts=art.parts.map((part,i)=>{if(interactive)part=part.replace(/<path class="outline[^"]*" d="([^"]+)"[^>]*\/>/g,(whole,d)=>whole+`<path class="hit-target" d="${d}" fill="none" stroke="transparent" stroke-width="18" pointer-events="stroke"/>`);const n=asset.nodes[i],p=art.positions[i];return `<g data-part="${esc(n.id)}" ${interactive?`role="button" tabindex="0" data-${interactive==='explore'?'explore':'select'}-part="${esc(n.id)}" aria-label="${esc(n.label)}" aria-pressed="${(interactive==='explore'?focus:chosen).includes(n.id)}"`:''} class="entity bio-part ${focus.includes(n.id)?'focus':''} ${chosen.includes(n.id)?'selected':''}"><g transform="translate(0 0)">${part}</g><text class="part-label" x="${p[0]}" y="${p[1]}" text-anchor="middle">${esc(n.label)}</text></g>`;}).join('');
 let svg=`<svg class="physics-illustration" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440" role="${interactive?'group':'img'}" aria-label="${esc(asset.title)} — original illustrative physical model"><defs><marker id="physics-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="var(--sec)"/></marker></defs>${art.base||''}${parts}</svg>`;
 if(standalone)svg=svg.replace('<svg ','<svg style="--v-blue:#2563eb;--v-purple:#7c3aed;--v-green:#047857;--v-gold:#a16207;--card:#fff;--ink:#0f172a;--sec:#334155;background:#fff" ').replace('><defs>','><style>.part-label{font:750 17px system-ui,sans-serif;fill:#0f172a;paint-order:stroke;stroke:#fff;stroke-width:4px}.anatomy-note{font:600 16px system-ui,sans-serif;fill:#334155}.flow{stroke-dasharray:2 19;stroke-linecap:round}</style><defs>');
 return svg;
}

return {physicalSvg};})();
__modules.diagram=(()=>{
const {physicalSvg}=__modules.visuals;
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function diagram(asset,focus=[],selection=false,chosen=[],teaching=false,motion=true){
 const e=escapeHtml;const illustration=physicalSvg(asset,focus,chosen,false,teaching?'explore':selection?'select':false);if(illustration){const animated=/class="[^"]*\b(flow|breath|diaphragm-motion|separate-left|thin-left)\b/.test(illustration);const legend=`<ul class="diagram-key">${asset.nodes.map(n=>`<li class="${focus.includes(n.id)?'key-active':''}">${e(n.label)}</li>`).join('')}</ul>`;return `<figure class="physics-figure" data-playing="${teaching&&motion&&animated}" data-visual="${e(asset.visual.type)}">${illustration}${legend}<figcaption>${e(asset.context)}</figcaption>${teaching&&animated?`<div class="visual-controls"><button data-action="playVisual" ${motion?'':'disabled'} aria-pressed="${motion}">${motion?'Pause process':'Motion reduced'}</button><button data-action="replayVisual" ${motion?'':'disabled'}>Replay process</button><span>Process overview · Select a structure or use lesson steps.</span></div>`:''}</figure>${selection?`<div class="choices" role="group" aria-label="Select diagram entities">${asset.nodes.map(n=>`<button data-node="${e(n.id)}" aria-pressed="${chosen.includes(n.id)}">${e(n.label)}</button>`).join('')}</div>`:''}`;}const nodes=Object.fromEntries(asset.nodes.map(n=>[n.id,n]));
 const lines=asset.edges.map(edge=>{const a=nodes[edge.from],b=nodes[edge.to],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),offset=Math.min(92/Math.abs(dx),31/Math.abs(dy))*d;return `<line x1="${a.x+dx/d*offset}" y1="${a.y+dy/d*offset}" x2="${b.x-dx/d*offset}" y2="${b.y-dy/d*offset}" marker-end="url(#arrow)"/>`;}).join('');
 return `<figure><svg viewBox="0 0 400 230" role="img" aria-label="${e(asset.title)}"><defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6"/></marker></defs>${lines}${asset.nodes.map(n=>`<g class="entity ${focus.includes(n.id)?'focus':''} ${chosen.includes(n.id)?'selected':''}"><rect x="${n.x-86}" y="${n.y-25}" width="172" height="50" rx="9"/><text x="${n.x}" y="${n.y+5}" text-anchor="middle">${e(n.label)}</text></g>`).join('')}</svg><figcaption>${e(asset.context)}</figcaption></figure>${selection?`<div class="choices" role="group" aria-label="Select diagram entities">${asset.nodes.map(n=>`<button data-node="${e(n.id)}" aria-pressed="${chosen.includes(n.id)}">${e(n.label)}</button>`).join('')}</div>`:''}`;
}

return {escapeHtml,diagram};})();
__modules.learn=(()=>{
const {diagram,escapeHtml:e}=__modules.diagram;
function teachingCards(lesson){return `<aside class="tstack teaching-cards" aria-label="Concept teaching cards">${[['coreRule','Core Rules','rule'],['memoryCue','Memory Cues','cue'],['traps','Common Mistakes / MCAT Traps','trap'],['application','MCAT Applications','app']].map(([key,label,type])=>{const card=lesson[key];return `<details class="tcard tc-${type}" data-card="${key}" ${type==='rule'?'open':''}><summary><span class="card-heading"><h3>${label}</h3><span class="card-hook">${e(card.title)}</span></span></summary><div class="card-body">${card.paragraphs.map(p=>`<p>${e(p)}</p>`).join('')}</div></details>`;}).join('')}<button class="practice-concept" data-action="practiceConcept">Practice this concept →</button></aside>`;}
function learnView(chapter,assets,index,step,options={}){const l=chapter.lessons[index];return `<nav class="cnav" aria-label="Concepts">${chapter.lessons.map((x,i)=>`<button class="cbtn" data-lesson="${i}" aria-pressed="${i===index}">${e(x.title)}</button>`).join('')}</nav><div class="grid2"><section class="card"><h2>${e(l.title)}</h2><p>Outline section ${e(l.section)} · Step ${step+1} of ${l.steps.length}</p>${diagram(assets[l.asset],l.steps[step].focus,false,[],true,options.motion!==false)}<p class="step" aria-live="polite">${e(l.steps[step].text)}</p><div class="actions"><button data-action="previous" ${step===0?'disabled':''}>Previous step</button><button data-action="next" ${step===l.steps.length-1?'disabled':''}>Next step</button></div></section>${teachingCards(l)}</div>`;}

return {teachingCards,learnView};})();
__modules.practice=(()=>{
const {diagram,escapeHtml:e}=__modules.diagram;
function stageKey(exercise,stage){return exercise.id+'/'+stage.id;}
function practiceView(chapter,assets,index,stageIndex,state,chosen,feedback){
 const ex=chapter.exercises[index],s=ex.stages[stageIndex],key=stageKey(ex,s),record=state.stages[key]||{},done=record.done===true;
 const options=s.type==='choice'?`<fieldset><legend>Choose one answer</legend>${s.options.map((o,i)=>`<label class="option"><input type="radio" name="answer" value="${i}" ${done?'disabled':''}> ${e(o)}</label>`).join('')}</fieldset>`:s.type==='selection'?'':`<label for="answer">Answer${s.unit?' ('+e(s.unit)+')':''}</label><input id="answer" name="answer" autocomplete="off" ${s.type==='number'?'inputmode="decimal"':''} ${done?'disabled':''}>`;
 const answer=s.type==='choice'?s.options[s.answer]:s.type==='selection'?s.answer.map(id=>assets[s.asset||ex.asset].nodes.find(n=>n.id===id).label).join(', '):s.answer+(s.unit&&s.unit!=='dimensionless'?' '+s.unit:'');
 return `<nav class="cnav" aria-label="Workshops">${chapter.exercises.map((x,i)=>`<button class="cbtn" data-exercise="${i}" aria-pressed="${i===index}">${e(x.title)}</button>`).join('')}</nav><section class="card practice"><h2>${e(ex.title)}</h2><p>Stage ${stageIndex+1} of ${ex.stages.length}</p><h3 id="question">${e(s.prompt)}</h3>${diagram(assets[s.asset||ex.asset],[],s.type==='selection'&&!done,chosen)}<form id="answer-form" aria-labelledby="question">${options}${done?'':`<button type="submit">Check answer</button>`}</form><p id="feedback" role="status" class="${done?'completed':''}">${e(done?(record.assisted?'Completed with assistance.':'Independently solved.') : feedback)}</p>${Array.from({length:record.hints||0},(_,i)=>`<p class="hint">Hint ${i+1}: ${e(s.hints[i])}</p>`).join('')}${done?`<div class="solution"><p><strong>Answer: ${e(answer)}</strong></p><p>${e(s.explanation)}</p></div><button data-action="advance">${stageIndex+1<ex.stages.length?'Next stage':'Restart workshop'}</button>`:`<div class="actions"><button data-action="hint" ${(record.hints||0)>=s.hints.length?'disabled':''}>Progressive hint</button><button data-action="reveal">Reveal answer (assisted)</button></div>`}</section>`;
}

return {stageKey,practiceView};})();
__modules.app=(()=>{
const {validateAnswer}=__modules.validation;
const {fresh,readProgress,writeProgress,sanitize}=__modules.progress;
const {escapeHtml:e}=__modules.diagram;
const {learnView}=__modules.learn;
const {practiceView,stageKey}=__modules.practice;
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

return {};})();
})();