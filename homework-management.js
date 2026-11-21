"use strict";
/* V8.0.3: Supabase-backed 15-set teacher editor. No student UI yet. */
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
  let cloudReady=false;
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
  const typeMap={"speaking-1":"read_aloud","speaking-2":"describe_picture","speaking-3":"respond_question","speaking-4":"respond_information","speaking-5":"express_opinion","writing-1":"write_sentence","writing-2":"respond_written_request","writing-3":"opinion_essay"};
  async function loadCloud(){
    try {
      const {data:auth,error:authErr}=await supabaseClient.auth.getUser();
      if(authErr||!auth?.user) throw Error("請先登入老師帳號");
      const [{data:rows,error:e1},{data:rules,error:e2}]=await Promise.all([
        supabaseClient.from("hw_sets").select("number,title,notes").order("number"),
        supabaseClient.from("hw_set_parts").select("set_number,section_type,part,question_count")
      ]);
      if(e1||e2)throw(e1||e2);
      if(!rows||rows.length!==15)throw Error("雲端尚未建立 15 組作業，請先執行安裝 SQL");
      const base=defaults();
      for(const row of rows){const s=base[row.number-1];if(!s)continue;s.title=row.title;s.notes=row.notes||"";}
      for(const r of rules||[]){const s=base[r.set_number-1],key=`${r.section_type}-${r.part}`;if(s&&key in s.rules)s.rules[key]=r.question_count;}
      if(!valid(base))throw Error("雲端作業設定格式不正確");
      sets=base;cloudReady=true;render();msg("已載入 Supabase 雲端設定");
      await showPoolCounts();
    }catch(err){cloudReady=false;msg(`雲端未連線：${err.message||err}。目前仍可匯出本機草稿，請先安裝 SQL。`);}
  }
  async function showPoolCounts(){
    const {data,error}=await supabaseClient.from("question_bank").select("section_type,question_type,status");
    if(error){msg(`作業已連線，但題庫統計無法讀取：${error.message}`);return;}
    const counts={};for(const q of data||[]){if(q.status&&!['active','published','enabled'].includes(String(q.status).toLowerCase()))continue;const k=`${q.section_type}:${q.question_type}`;counts[k]=(counts[k]||0)+1;}
    let container=el("hwPoolCounts");if(!container){container=document.createElement("div");container.id="hwPoolCounts";container.className="hw-summary";el("hwSummary").after(container);}
    container.textContent="目前可抽題量："+parts.map(([sec,p])=>`${sec==='speaking'?'口':'寫'}P${p} ${counts[`${sec}:${typeMap[`${sec}-${p}`]}`]||0} 題`).join('｜')+"（若題目有共用素材，正式發布前仍須確認題組規則）";
  }
  el("hwSave").addEventListener("click",async()=>{
    readForm();const s=sets[current];
    try{
      if(!cloudReady)throw Error("尚未連接雲端，不能儲存到 Supabase");
      el("hwSave").disabled=true;
      const {error}=await supabaseClient.rpc("hw_save_set",{p_number:s.number,p_title:s.title,p_notes:s.notes,p_rules:s.rules});
      if(error)throw error;
      localStorage.setItem(KEY,JSON.stringify(sets));renderList();msg(`Homework ${String(s.number).padStart(2,'0')} 已儲存到 Supabase`);
    }catch(e){msg(`儲存失敗：${e.message||e}。可以先匯出 JSON 備份。`);}finally{el("hwSave").disabled=false;}
  });
  el("hwExport").addEventListener("click",()=>{readForm();const blob=new Blob([JSON.stringify({format:"aspect-homework-planning-v802",sets},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="aspect-homework-15-sets.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);msg("已匯出設定檔");});
  el("hwImport").addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>200000){msg("檔案過大");return;}try{const data=JSON.parse(await f.text());if(data.format!=="aspect-homework-planning-v802"||!valid(data.sets))throw Error("Invalid format");sets=data.sets;current=0;render();msg("匯入成功；請逐組按『儲存到 Supabase』以同步 15 組設定");}catch(err){msg("匯入失敗：檔案格式或題數不符合規格");}finally{e.target.value="";}});
  el("hwReset").addEventListener("click",()=>{if(!confirm("要將全部15組重設為完整模擬考題數嗎？（請先匯出備份）"))return;sets=defaults();current=0;render();msg("已重設目前編輯草稿；請逐組儲存到 Supabase");});
  render();
  loadCloud();
})();
