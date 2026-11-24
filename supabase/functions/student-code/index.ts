import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const reply=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status,headers});
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return reply({error:'Method not allowed'},405);
 try{
 const {name,code,mode}=await req.json();
 if(typeof name!=='string'||name.length>80||typeof code!=='string'||! /^[a-f0-9]{24}$/i.test(code.trim())||!['exam','homework'].includes(mode))return reply({error:'姓名或代碼無效'},400);
 const url=Deno.env.get('SUPABASE_URL')!, key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, anon=Deno.env.get('SUPABASE_ANON_KEY')!;
 const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:r,error}=await admin.rpc('v901d_lookup',{p_name:name,p_code:code,p_mode:mode});
 if(error||!r?.email)return reply({error:'姓名、代碼或權益無效'},403);
 const {data:link,error:le}=await admin.auth.admin.generateLink({type:'magiclink',email:r.email}); if(le||!link.properties?.hashed_token)throw Error('link');
 const client=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:auth,error:ae}=await client.auth.verifyOtp({token_hash:link.properties.hashed_token,type:'email'}); if(ae||!auth.session||auth.user?.id!==r.student)throw Error('auth');
 const payload=JSON.parse(atob(auth.session.access_token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(auth.session.access_token.split('.')[1].length/4)*4,'=')));
 const {error:ge}=await admin.from('v901d_grants').insert({sid:payload.session_id,code_id:r.id,student:r.student,expires:new Date(Math.min(Date.parse(r.expires),Date.now()+4*3600000)).toISOString()}); if(ge)throw Error('grant');
 return reply({access_token:auth.session.access_token,refresh_token:auth.session.refresh_token});
 }catch{return reply({error:'驗證失敗，請聯絡老師'},500);}
});
