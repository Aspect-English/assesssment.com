"use strict";
/* V8.0.2: local-only draft editor. No Supabase writes and no student access. */
(() => {
  const KEY = "aspect_homework_planning_v802";
  const parts = [
    ["speaking",1,"Read a Text Aloud",2],["speaking",2,"Describe a Picture",2],
    ["speaking",3,"Respond to Questions",3],["speaking",4,"Respond Using Information",3],
    ["speaking",5,"Express an Opinion",1],
    ["writing",1,"Write a Sentence Based on a Picture",5],
    ["writing",2,"Respond to a Written Request",2],
    ["writing",3,"Write an Opinion Essay",1]
  ];
  const defaults = () => Array.from({length:15},(_,i)=>({number:i+1,title:`Homework ${String(i+1).padStart(2,"0")}`,notes:"",rules:Object.fromEntries(parts.map(p=>[`${p[0]}-${p[1]}`,p[3]]))}));
  let sets=defaults(),current=0;
  const el=id=>document.getElementById(id);
  if(!el("homeworkSection")) return;
  try {
    const saved=JSON.parse(localStorage.getItem(KEY));
    if(valid(saved)) sets=saved;
  }catch(err){console.warn("Homework local draft unavailable",err)}
  function valid(data){return Array.isArray(data)&&data.length===15&&data.every((s,i)=>s&&s.number===i+1&&typeof s.title==="string"&&s.title.length<=100&&typeof s.notes==="string"&&s.notes.length<=1000&&s.rules&&parts.every(p=>Number.isInteger(s.rules[`${p[0]}-${p[1]}`])&&s.rules[`${p[0]}-${p[1]}`]>=0&&s.rules[`${p[0]}-${p[1]}`]<=50));}
  function msg(t){el("hwMessage").textContent=t;}
  function renderList(){el("hwSetList").replaceChildren(...sets.map((s,i)=>{const b=document.createElement("button");b.type="button";b.textContent=`${String(i+1).padStart(2,"0")} · ${s.title}`;b.setAttribute("aria-current",String(i===current));b.addEventListener("click",()=>{readForm();current=i;render();});return b;}));}
  function render(){const s=sets[current];el("hwCurrentTitle").textContent=`Homework ${String(s.number).padStart(2,"0")}`;el("hwTitle").value=s.title;el("hwNotes").value=s.notes;
    const table=document.createElement("table");table.className="hw-rule-table";
    const head=document.createElement("tr");for(const v of ["類別","Part / 題型","題數"]){const th=document.createElement("th");th.textContent=v;head.append(th);}table.append(head);
    for(const [sec,part,name] of parts){const tr=document.createElement("tr");for(const val of [sec==="speaking"?"口說":"寫作",`Part ${part} — ${name}`]){const td=document.createElement("td");td.textContent=val;tr.append(td);}const td=document.createElement("td"),input=document.createElement("input");input.type="number";input.min="0";input.max="50";input.step="1";input.value=s.rules[`${sec}-${part}`];input.dataset.rule=`${sec}-${part}`;input.setAttribute("aria-label",`${sec} Part ${part} 題數`);input.addEventListener("input",()=>{readForm();summary();});td.append(input);tr.append(td);table.append(tr);}el("hwRules").replaceChildren(table);renderList();summary();msg("");}
  function readForm(){const s=sets[current];s.title=el("hwTitle").value.trim().slice(0,100)||`Homework ${String(s.number).padStart(2,"0")}`;s.notes=el("hwNotes").value.slice(0,1000);el("hwRules").querySelectorAll("input[data-rule]").forEach(inp=>{const n=Number(inp.value);if(Number.isInteger(n)&&n>=0&&n<=50)s.rules[inp.dataset.rule]=n;});}
  function summary(){const s=sets[current],total=(sec)=>parts.filter(p=>p[0]===sec).reduce((n,p)=>n+s.rules[`${p[0]}-${p[1]}`],0);const missing=parts.filter(p=>s.rules[`${p[0]}-${p[1]}`]<1).length;el("hwSummary").textContent=`口說 ${total("speaking")} 題／寫作 ${total("writing")} 題；${missing?`有 ${missing} 個 Part 尚未配置，不能發布。`:"各 Part 均已配置（仍需確認題庫數量）。"}`;}
  el("hwSave").addEventListener("click",()=>{readForm();try{localStorage.setItem(KEY,JSON.stringify(sets));renderList();msg("已儲存在這台裝置的瀏覽器中（尚未同步 Supabase）");}catch(e){msg("無法儲存：請改用匯出 JSON");}});
  el("hwExport").addEventListener("click",()=>{readForm();const blob=new Blob([JSON.stringify({format:"aspect-homework-planning-v802",sets},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="aspect-homework-15-sets.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);msg("已匯出設定檔");});
  el("hwImport").addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>200000){msg("檔案過大");return;}try{const data=JSON.parse(await f.text());if(data.format!=="aspect-homework-planning-v802"||!valid(data.sets))throw Error("Invalid format");sets=data.sets;current=0;render();msg("匯入成功，請按儲存本機草稿");}catch(err){msg("匯入失敗：檔案格式或題數不符合規格");}finally{e.target.value="";}});
  el("hwReset").addEventListener("click",()=>{if(!confirm("要將全部15組重設為完整模擬考題數嗎？（請先匯出備份）"))return;sets=defaults();current=0;render();msg("已重設草稿，按儲存才會覆蓋本機紀錄");});
  render();
})();
