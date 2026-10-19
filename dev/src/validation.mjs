export function validateAnswer(stage,value){
 if(stage.type==='choice')return Number.isInteger(value)&&value>=0&&value<stage.options.length&&value===stage.answer;
 if(stage.type==='selection')return Array.isArray(value)&&value.every(x=>typeof x==='string')&&new Set(value).size===value.length&&value.length===stage.answer.length&&stage.answer.every(x=>value.includes(x));
 if(stage.type==='text')return typeof value==='string'&&[stage.answer,...(stage.aliases||[])].some(x=>stage.caseSensitive===false?x.toLowerCase()===value.trim().toLowerCase():x===value.trim());
 if(stage.type==='number'){if(typeof value!=='string'&&typeof value!=='number')return false;const s=String(value).trim();return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(s)&&Number.isFinite(Number(s))&&Math.abs(Number(s)-stage.answer)<=(stage.tolerance||0);}
 return false;
}
