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
  if r.revoked or p_until<=r.expires then raise exception 'Choose a later expiry for a non-revoked code'; end if;
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
-- Prevent old homework issuance endpoint bypassing the new management flow; preserve exam issuance.
create or replace function public.v901d_issue(p_student uuid,p_mode text,p_kind text,p_hours integer) returns text language plpgsql security definer set search_path='' as $$
declare c text;
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role in ('teacher','admin') and status='active') then raise exception 'Staff required'; end if;
 if not exists(select 1 from public.profiles where id=p_student and role='student' and status='active') then raise exception 'Active student required'; end if;
 if p_mode is distinct from 'exam' or p_hours is null or p_hours not between 1 and 8760 or p_kind is null or p_kind not in ('quick','full','speaking','writing') then raise exception 'Invalid exam settings'; end if;
 c:=upper(encode(extensions.gen_random_bytes(12),'hex'));
 insert into public.v901d_codes(student,mode,kind,digest,expires) values(p_student,p_mode,p_kind,encode(extensions.digest(c,'sha256'),'hex'),now()+make_interval(hours=>p_hours)); return c;
end;$$;
commit;
