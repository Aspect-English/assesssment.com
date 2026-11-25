"use strict";
/* V8.0.4 teacher-only assignment panel. No student exam flow yet. */
(()=>{
 const $=id=>document.getElementById(id); if(!$('hwAssignPanel'))return;
 let students=[], codeInfo=new Map(), codeError=false;
 const say=t=>{$('hwAssignMessage').textContent=t;};
 const dt=v=>{if(!v)return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d.toISOString();};
 async function refresh(){
  if(typeof supabaseClient==='undefined'){say('Supabase client 未載入');return;}
  const {data,error}=await supabaseClient.rpc('hw_v804_students');
  if(error){say('學生清單讀取失敗：'+error.message);$('hwStudentMessage').textContent='學生清單讀取失敗：'+error.message;return false;}
  students=data||[]; const result=await supabaseClient.rpc("v901d_student_code_list"); codeError=!!result.error; codeInfo=new Map((result.data||[]).map(x=>[x.student_id,x])); const sel=$('hwAssignStudent');const previous=sel.value;sel.replaceChildren();const blank=document.createElement('option');blank.value='';blank.textContent='請選擇學生';sel.append(blank);
  for(const x of data||[]){const o=document.createElement('option');o.value=x.id;o.textContent=(x.display_name||x.email||'學生')+' ('+(x.email||x.id)+')';sel.append(o);}
  if(previous && students.some(x=>x.id===previous))sel.value=previous;
  const manage=$('hwManageStudent');const previousManage=manage.value;manage.replaceChildren();
  const mblank=document.createElement('option');mblank.value='';mblank.textContent='請選擇學生';manage.append(mblank);
  for(const x of students){const o=document.createElement('option');o.value=x.id;o.textContent=(x.display_name||x.email||'學生')+' ('+(x.email||x.id)+')';manage.append(o);}
  if(previousManage && students.some(x=>x.id===previousManage))manage.value=previousManage;syncName();renderStudents();
  if(!data?.length)say('目前沒有學生帳號。請先透過 Supabase Auth 建立測試學生及 profiles 紀錄。');
  await history();return true;
 }
 async function history(){const set=Number(($('hwCurrentTitle')?.textContent||'').match(/\d+/)?.[0]);if(!set)return;
  const {data,error}=await supabaseClient.from('hw_v804_assignments').select('id,student_id,set_number,status,opens_at,due_at').eq('set_number',set).order('created_at',{ascending:false}).limit(30);
  const target=$('hwAssignHistory');target.replaceChildren();if(error){say('指派紀錄讀取失敗：'+error.message);return;}
  const heading=document.createElement('strong');heading.textContent=`Homework ${set} 已指派 ${data?.length||0} 筆（最多顯示 30 筆）`;target.append(heading);
  for(const x of data||[]){const p=document.createElement('p');p.textContent=`${x.student_id}｜${x.status}｜截止 ${new Date(x.due_at).toLocaleString('zh-TW')}`;target.append(p);}
 }

 function syncName(){const item=students.find(x=>x.id===$('hwManageStudent').value);$('hwStudentName').value=item?.display_name||'';}
 function renderStudents(){
  const q=$('hwStudentSearch').value.trim().toLowerCase();const rows=$('hwStudentRows');rows.replaceChildren();
  const filtered=students.filter(x=>[x.display_name,x.email].some(v=>String(v||'').toLowerCase().includes(q)));
  $('hwStudentCount').textContent=`${filtered.length} / ${students.length} 人`;
  for(const x of filtered){const tr=document.createElement('tr');for(const value of [x.display_name||'未設定姓名',codeInfo.get(x.id)?.expires?new Date(codeInfo.get(x.id).expires).toLocaleString('zh-TW'):'—',codeError?'讀取失敗':!codeInfo.has(x.id)?'未發放':codeInfo.get(x.id).revoked?'已停用':Date.parse(codeInfo.get(x.id).expires)<=Date.now()?'已到期':'使用中']){const td=document.createElement('td');td.textContent=value;tr.append(td);}const td=document.createElement('td'),b=document.createElement('button');b.type='button';b.textContent='編輯';b.addEventListener('click',()=>{$('hwManageStudent').value=x.id;syncName();$('hwStudentMessage').textContent='';$('hwStudentName').focus();});const del=document.createElement('button');del.type='button';del.textContent='刪除';del.style.cssText='color:#b42318;border-color:#f0b4ae;margin-left:8px';del.addEventListener('click',async e=>{e.stopPropagation();if(!confirm(`確定刪除（封存）「${x.display_name||'學生'}」？將撤銷代碼及作業權益，保留歷史紀錄。`))return;del.disabled=true;const m=$('d6StudentMsg');m.textContent='處理中…';try{const {error}=await supabaseClient.rpc('v901d_archive_student',{p_student:x.id});if(error)throw error;const ok=await refresh();m.textContent=ok?'學生已封存，歷史紀錄保留。':'已封存，請重新載入清單。';}catch(e){m.textContent='刪除失敗：'+(e.message||e);}finally{del.disabled=false;}});td.append(b,del);tr.append(td);rows.append(tr);}
  if(!filtered.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.textContent=q?'找不到符合的學生':'目前沒有學生';tr.append(td);rows.append(tr);}
 }
 document.addEventListener('d5-refresh-codes',async()=>{const r=await supabaseClient.rpc('v901d_student_code_list');codeError=!!r.error;codeInfo=new Map((r.data||[]).map(x=>[x.student_id,x]));renderStudents();});
 $('hwStudentSearch').addEventListener('input',renderStudents);
 $('hwManageStudent').addEventListener('change',syncName);
 $('hwStudentReload').addEventListener('click',async()=>{if(await refresh())$('hwStudentMessage').textContent='學生清單已重新載入';});
 $('hwStudentRename').addEventListener('click',async()=>{
  const id=$('hwManageStudent').value,name=$('hwStudentName').value.trim();
  if(!id){$('hwStudentMessage').textContent='請先選擇學生';return;}
  if(!name||name.length>80){$('hwStudentMessage').textContent='請輸入 1～80 字的學生姓名';return;}
  const btn=$('hwStudentRename');btn.disabled=true;
  try{
   const {error}=await supabaseClient.rpc('hw_v804_rename_student',{p_student:id,p_name:name});
   if(error)throw error;
   if(await refresh())$('hwStudentMessage').textContent='學生姓名已儲存至 Supabase';
  }catch(e){$('hwStudentMessage').textContent='修改失敗：'+(e.message||e);}
  finally{btn.disabled=false;}
 });
 $('hwAssignButton').addEventListener('click',async()=>{
  const student=$('hwAssignStudent').value,set=Number(($('hwCurrentTitle')?.textContent||'').match(/\d+/)?.[0]);
  const opens=dt($('hwAssignOpen').value),due=dt($('hwAssignDue').value),until=dt($('hwAccessUntil').value);
  if(!student||!set||!opens||!due||!until||new Date(due)<=new Date(opens)||new Date(until)<new Date(due)){say('請選學生並設定有效的開放、截止及權益日期（權益不得早於截止日）');return;}
  if(!confirm(`確定指派 Homework ${set}？系統會立即固定抽題，不能重複指派。`))return;
  const b=$('hwAssignButton');b.disabled=true;
  try{
   const {error:e1}=await supabaseClient.rpc('hw_v804_grant_access',{p_student:student,p_until:until});if(e1)throw e1;
   const {data,error}=await supabaseClient.rpc('hw_v804_assign',{p_student:student,p_set:set,p_opens:opens,p_due:due});if(error)throw error;
   say('指派成功！作業 ID：'+data+'。題目已在資料庫固定分配。');await history();
  }catch(e){say('指派未完成：'+(e.message||e)+'。如題庫不足，資料庫會撤回該次作業與抽題。');}finally{b.disabled=false;}
 });
 const observer=new MutationObserver(()=>{history();});if($('hwCurrentTitle'))observer.observe($('hwCurrentTitle'),{childList:true});
 refresh();
})();
