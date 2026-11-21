"use strict";
/* V8.0.4 teacher-only assignment panel. No student exam flow yet. */
(()=>{
 const $=id=>document.getElementById(id); if(!$('hwAssignPanel'))return;
 let students=[];
 const say=t=>{$('hwAssignMessage').textContent=t;};
 const dt=v=>{if(!v)return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d.toISOString();};
 async function refresh(){
  if(typeof supabaseClient==='undefined'){say('Supabase client 未載入');return;}
  const {data,error}=await supabaseClient.rpc('hw_v804_students');
  if(error){say('請先安裝 V8.0.4 SQL：'+error.message);return;}
  students=data||[]; const sel=$('hwAssignStudent');const previous=sel.value;sel.replaceChildren();const blank=document.createElement('option');blank.value='';blank.textContent='請選擇學生';sel.append(blank);
  for(const x of data||[]){const o=document.createElement('option');o.value=x.id;o.textContent=(x.display_name||x.email||'學生')+' ('+(x.email||x.id)+')';sel.append(o);}
  if(previous && students.some(x=>x.id===previous))sel.value=previous;syncName();
  if(!data?.length)say('目前沒有學生帳號。請先透過 Supabase Auth 建立測試學生及 profiles 紀錄。');
  await history();
 }
 async function history(){const set=Number(($('hwCurrentTitle')?.textContent||'').match(/\d+/)?.[0]);if(!set)return;
  const {data,error}=await supabaseClient.from('hw_v804_assignments').select('id,student_id,set_number,status,opens_at,due_at').eq('set_number',set).order('created_at',{ascending:false}).limit(30);
  const target=$('hwAssignHistory');target.replaceChildren();if(error){say('指派紀錄讀取失敗：'+error.message);return;}
  const heading=document.createElement('strong');heading.textContent=`Homework ${set} 已指派 ${data?.length||0} 筆（最多顯示 30 筆）`;target.append(heading);
  for(const x of data||[]){const p=document.createElement('p');p.textContent=`${x.student_id}｜${x.status}｜截止 ${new Date(x.due_at).toLocaleString('zh-TW')}`;target.append(p);}
 }

 function syncName(){const item=students.find(x=>x.id===$('hwAssignStudent').value);$('hwStudentName').value=item?.display_name||'';}
 $('hwAssignStudent').addEventListener('change',syncName);
 $('hwStudentReload').addEventListener('click',async()=>{await refresh();$('hwStudentMessage').textContent='學生清單已重新載入';});
 $('hwStudentRename').addEventListener('click',async()=>{
  const id=$('hwAssignStudent').value,name=$('hwStudentName').value.trim();
  if(!id){$('hwStudentMessage').textContent='請先選擇學生';return;}
  if(!name||name.length>80){$('hwStudentMessage').textContent='請輸入 1～80 字的學生姓名';return;}
  const btn=$('hwStudentRename');btn.disabled=true;
  try{
   const {error}=await supabaseClient.rpc('hw_v804_rename_student',{p_student:id,p_name:name});
   if(error)throw error;
   await refresh();$('hwStudentMessage').textContent='學生姓名已儲存至 Supabase';
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
