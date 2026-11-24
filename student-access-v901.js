(()=>{
'use strict';
const $=id=>document.getElementById(id), name=$('studentName'), select=$('testType'), start=$('startButton'), status=$('v901Status'), login=$('v901Login'), out=$('v901SignOut'), sign=$('v901SignIn');
const options=Array.from(select.options).map(o=>({value:o.value,text:o.textContent}));
let busy=false;
function lock(){name.value='';select.replaceChildren(new Option('請先登入學生帳號',''));select.disabled=true;start.disabled=true;}
async function refresh(){lock();try{const {data,error}=await supabaseClient.rpc('v901_student_exam_access');if(error)throw error;name.value=data.name;login.hidden=true;out.hidden=false;select.replaceChildren(new Option('請選擇測驗類型',''));for(const o of options.filter(o=>o.value&&!data.completed.includes(o.value)))select.add(new Option(o.text,o.value));select.disabled=select.options.length===1;start.disabled=select.disabled;status.textContent=select.disabled?'所有測驗均已完成。':'已驗證學生身分；僅顯示尚未完成的測驗。';return true;}catch(e){login.hidden=false;out.hidden=true;status.textContent='請使用有效學生帳號登入。若已登入仍無法使用，請聯絡老師確認 SQL 與帳號角色。';return false;}}
sign.onclick=async()=>{if(busy)return;busy=true;sign.disabled=true;try{const {error}=await supabaseClient.auth.signInWithPassword({email:$('v901Email').value.trim(),password:$('v901Password').value});$('v901Password').value='';if(error)throw error;await refresh();}catch(e){lock();status.textContent='登入失敗，請確認 Email 與密碼。';}finally{busy=false;sign.disabled=false;}};
out.onclick=async()=>{const {error}=await supabaseClient.auth.signOut({scope:'local'});if(error){status.textContent='登出失敗，請重試。';return;}await refresh();};
window.StudentAccessV901={refresh,async verifySelection(){const choice=select.value;if(!choice)return false;const ok=await refresh();if(!ok||!Array.from(select.options).some(o=>o.value===choice)){status.textContent='此測驗目前不可開始，請重新選擇。';return false;}select.value=choice;return true;}};
refresh();
})();
