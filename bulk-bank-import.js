'use strict';
(()=>{
const $=id=>document.getElementById(id);
const types=[['speaking','read_aloud',1,45,45],['speaking','describe_picture',2,45,30],['speaking','respond_question',3,3,15],['speaking','respond_information',4,3,15],['speaking','express_opinion',5,45,60],['writing','write_sentence',1,0,0,'writing_part1',480],['writing','respond_written_request',2,0,600,'writing_part2',600],['writing','opinion_essay',3,0,1800,'writing_part3',1800]];
let rows=[],busy=false,ready=false;
const maxima=[3,3,3,3,5,3,4,5];
const criteria=['發音、語調及重音','圖片描述、語言清晰度與連貫性','回答相關性及完整性','資訊正確性及回答完整性','立場、理由、組織及語言表達','指定單字、文法及圖片相關性','任務完成度、組織及語言表達','論點發展、組織、文法及字彙'];
let rubricEpoch=0;
function defaults(i){const max=maxima[i], out={};for(let n=0;n<=max;n++)out[n]=n===0?'無有效作答或未作答':n===max?'充分達成要求；'+criteria[i]:n===1?'僅有限達成要求；'+criteria[i]:`部分達成要求（${n}/${max}）；`+criteria[i];return out;}
async function loadRubric(){const epoch=++rubricEpoch,i=Number($('type').value),key=types[i][1];$('rubricSave').disabled=true;$('rubric').replaceChildren();$('rubricStatus').textContent='載入中';let levels=defaults(i);try{const {data,error}=await supabaseClient.from('bank_part_rubrics').select('levels').eq('part_key',key).maybeSingle();if(error)throw error;if(epoch!==rubricEpoch)return;if(data)levels={...levels,...data.levels};$('rubricStatus').textContent=data?'已載入雲端設定':'使用教學用預設摘要';for(let n=maxima[i];n>=0;n--){const e=field($('rubric'),`${n} 分`,levels[n]);e.dataset.score=n;}$('rubricSave').disabled=false;}catch(e){if(epoch===rubricEpoch)$('rubricStatus').textContent='載入失敗：'+e.message;}}
$('rubricSave').onclick=async()=>{const i=Number($('type').value),epoch=rubricEpoch,levels={};for(const e of $('rubric').querySelectorAll('textarea'))levels[e.dataset.score]=e.value.trim();if(Object.values(levels).some(v=>!v)){ $('rubricStatus').textContent='請填寫所有級距';return;} $('rubricSave').disabled=true;try{if(!await requireTeacherAccess())throw Error('無權限');const {error}=await supabaseClient.from('bank_part_rubrics').upsert({part_key:types[i][1],levels,updated_at:new Date().toISOString()});if(error)throw error;if(epoch===rubricEpoch)$('rubricStatus').textContent='已儲存至 Supabase';}catch(e){if(epoch===rubricEpoch)$('rubricStatus').textContent=e.message;}finally{if(epoch===rubricEpoch)$('rubricSave').disabled=false;}};
$('type').addEventListener('change',()=>{if(ready)loadRubric()});
for(const [i,t] of types.entries()){const o=document.createElement('option');o.value=i;o.textContent=`${t[0]} Part ${t[2]} — ${t[1]}`;$('type').append(o)}
function invalidate(){rows=[];$('rows').textContent='請重新解析';$('save').disabled=true;}
for(const id of ['book','type','shared','text']) $(id).addEventListener('input',invalidate);
function field(parent,label,value,kind='textarea'){const l=document.createElement('label');l.textContent=label;const e=document.createElement(kind==='textarea'?'textarea':'input');if(kind==='textarea')e.rows=3;else e.type=kind;if(kind!=='file')e.value=value||'';l.append(e);parent.append(l);return e;}
$('parse').onclick=()=>{try{
const book=$('book').value.trim().toUpperCase();if(!/^[A-Z0-9_-]{1,40}$/.test(book))throw Error('題本代碼僅限英文、數字、底線及連字號');
const t=types[Number($('type').value)],text=$('text').value.trim(),shared=$('shared').value.trim();if(!text)throw Error('請貼上題目');
const matches=[...text.matchAll(/^(?:Question\s+|Q\s*)(\d+)\s*[:.：]?\s*$/gim)];let items=matches.length?matches.map((m,i)=>({n:Number(m[1]),body:text.slice(m.index+m[0].length,matches[i+1]?.index??text.length).trim()})):[{n:1,body:text}];
if(matches.length&&text.slice(0,matches[0].index).trim())throw Error('題號前有文字，請移至共用文章欄');
if(items.some(x=>!x.body)||new Set(items.map(x=>x.n)).size!==items.length||items.length>100)throw Error('空題、重複題號或超過100題');
const group=t[0]==='speaking'&&[3,4].includes(t[2]);if(group&&(!shared||items.map(x=>x.n).join(',')!==(t[2]===3?'5,6,7':'8,9,10')))throw Error('請填共用素材文字及完整三題，依正確題號排序');
if(t[1]==='respond_written_request'&&(items.length!==1||!shared))throw Error('寫作 P2 每次一題，並填入 Email');
$('rows').replaceChildren();rows=[];
for(const x of items){const code=`${t[0]==='speaking'?'SPK':'WRT'}-P${t[2]}-${book}-Q${String(x.n).padStart(2,'0')}`;const card=document.createElement('section');const h=document.createElement('strong');h.textContent=code;card.append(h);$('rows').append(card);
const passage=field(card,'文章／共用素材',t[1]==='read_aloud'?x.body:shared),prompt=field(card,'題目／指定單字',t[1]==='read_aloud'?'':x.body),directions=field(card,'Directions',t[1]==='respond_question'?'P3_INTRO_SECONDS=3':t[1]==='respond_information'?'P4_INFO_SECONDS=45':''),image=field(card,'圖片（選填，圖片題發布前必須補齊）','','file'),audio=field(card,'題目音檔（選填）','','file');image.accept='image/*';audio.accept='audio/*';for(const [input,tag] of [[image,'img'],[audio,'audio']]){let url;const media=document.createElement(tag);media.style.maxWidth='100%';media.style.display='none';if(tag==='audio')media.controls=true;card.append(media);input.addEventListener('change',()=>{if(url)URL.revokeObjectURL(url);const f=input.files[0];media.style.display=f?'block':'none';if(f){url=URL.createObjectURL(f);media.src=url;}});}rows.push({code,t,n:x.n,passage,prompt,directions,image,audio});}
$('save').disabled=!ready;$('log').textContent=`已解析 ${rows.length} 題。請核對內容；共用音檔請於原題組編輯器補齊。`;
}catch(e){invalidate();$('log').textContent=e.message}};
$('save').onclick=async()=>{if(busy||!ready||!rows.length)return;busy=true;const batch=rows.slice();$('save').disabled=true;$('parse').disabled=true;const controls=[...document.querySelectorAll('input,textarea,select')];controls.forEach(e=>e.disabled=true);try{
if(!await requireTeacherAccess())throw Error('無老師權限');const payloads=[];for(const r of batch){if(await findQuestionByCode(r.code))throw Error('已有題目代碼 '+r.code+'；本批未寫入');if(!(r.t[1]==='read_aloud'?r.passage.value:r.prompt.value).trim())throw Error('題目內容不可空白 '+r.code);}
for(const r of batch){const t=r.t;const image=r.image.files[0],audio=r.audio.files[0];if(image&&!image.type.startsWith('image/'))throw Error('圖片格式錯誤');if(audio&&!audio.type.startsWith('audio/'))throw Error('音檔格式錯誤');payloads.push(normalizeQuestionPayload({question_code:r.code,section_type:t[0],question_type:t[1],title:r.code,directions:r.directions.value,passage:r.passage.value,prompt:r.prompt.value,image_url:image?await uploadQuestionAsset(image,'bulk-v807/images'):null,audio_url:audio?await uploadQuestionAsset(audio,'bulk-v807/audio'):null,preparation_time:t[3],response_time:[7,10].includes(r.n)&&t[0]==='speaking'&&[3,4].includes(t[2])?30:t[4],timer_group:t[5],shared_response_time:t[6],status:'draft'}));}
const {error}=await supabaseClient.from('question_bank').insert(payloads);if(error)throw error;$('log').textContent=`成功新增 ${payloads.length} 題草稿。請至題庫管理確認、補齊素材後啟用。`;rows=[];
}catch(e){$('log').textContent='匯入未確認成功：'+(e.message||e)+'。請先查題庫確認是否已寫入；已上傳素材可能仍保留。';}finally{busy=false;controls.forEach(e=>e.disabled=false);$('parse').disabled=false;$('save').disabled=!rows.length;}};
(async()=>{try{if(!await requireTeacherAccess())return;ready=true;$('auth').textContent='已驗證老師身分；只新增草稿，不覆蓋舊題。';$('parse').disabled=false;await loadRubric();}catch(e){$('auth').textContent='驗證失敗：'+e.message}})();
})();
