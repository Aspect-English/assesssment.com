begin;
create or replace function public.v901d_manage_homework(p_student uuid,p_action text,p_until timestamptz) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.v901d_codes%rowtype; c text; found_code boolean;
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role in ('teacher','admin') and status='active') then raise exception 'Staff required'; end if;
 if not exists(select 1 from public.profiles where id=p_student and role='student' and status='active') then raise exception 'Active student required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_student::text,9012));
 select * into r from public.v901d_codes where student=p_student and mode='homework' order by revoked asc,expires desc,id limit 1 for update;
 found_code:=found;
 if p_action='status' then return jsonb_build_object('exists',found_code,'expires',r.expires,'revoked',r.revoked); end if;
 if p_action is null or p_action not in ('issue','reset','extend','revoke') then raise exception 'Invalid action'; end if;
 if p_action<>'revoke' and (p_until is null or p_until<=now() or p_until>now()+interval '366 days') then raise exception 'Expiry must be within 366 days'; end if;
 if p_action='issue' and found_code then raise exception 'Code already exists; use reset'; end if;
 if p_action<>'issue' and not found_code then raise exception 'No code'; end if;
 if p_action='extend' then
  if r.revoked then raise exception 'Code is manually disabled; use reset'; end if;
  update public.v901d_grants set expires=least(expires,p_until) where code_id=r.id;
  update public.v901d_codes set expires=p_until where id=r.id;
 elsif p_action='revoke' then
  update public.v901d_codes set revoked=true where student=p_student and mode='homework';
 else
  update public.v901d_codes set revoked=true where student=p_student and mode='homework';
  c:=upper(encode(extensions.gen_random_bytes(12),'hex'));
  insert into public.v901d_codes(student,mode,digest,expires) values(p_student,'homework',encode(extensions.digest(c,'sha256'),'hex'),p_until);
 end if;
 return jsonb_build_object('ok',true,'code',c);
end;$$;
revoke all on function public.v901d_manage_homework(uuid,text,timestamptz) from public,anon,authenticated;
grant execute on function public.v901d_manage_homework(uuid,text,timestamptz) to authenticated;
create or replace function public.v901d_access() returns jsonb language plpgsql security definer set search_path='' as $$
declare r record; n text; done jsonb; hw jsonb;
begin
 select c.mode,c.kind,c.used_at,g.exam_session into r from public.v901d_grants g join public.v901d_codes c on c.id=g.code_id where g.sid=(auth.jwt()->>'session_id')::uuid and g.student=auth.uid() and g.expires>now() and c.expires>now() and not c.revoked;
 if not found then raise exception 'Code session required'; end if;
 select display_name into n from public.profiles where id=auth.uid() and role='student' and status='active'; if n is null then raise exception 'Inactive student'; end if;
 select coalesce(jsonb_agg(distinct test_type),'[]'::jsonb) into done from public.test_sessions where student_account_id=auth.uid() and status='completed';
 select coalesce(jsonb_agg(jsonb_build_object('week',a.set_number,'status',a.status,'due',a.due_at) order by a.set_number),'[]'::jsonb) into hw from public.hw_v804_assignments a where a.student_id=auth.uid() and a.opens_at<=now() and a.status in ('assigned','in_progress') and exists(select 1 from public.hw_v804_access x where x.user_id=auth.uid() and x.enabled and x.valid_until>now());
 return jsonb_build_object('name',n,'mode',r.mode,'kind',case when r.used_at is null then r.kind else null end,'completed',done,'homework',case when r.mode='homework' then hw else '[]'::jsonb end);
end;$$;
revoke all on function public.v901d_access() from public,anon;
grant execute on function public.v901d_access() to authenticated;
commit;
