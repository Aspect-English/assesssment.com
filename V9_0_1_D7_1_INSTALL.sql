begin;
create schema if not exists v901d_private;
revoke all on schema v901d_private from public, anon, authenticated;
create table if not exists v901d_private.homework_codes (
 code_id uuid primary key references public.v901d_codes(id) on delete cascade,
 secret text not null
);
alter table v901d_private.homework_codes enable row level security;
revoke all on v901d_private.homework_codes from public, anon, authenticated;

create or replace function public.v901d_manage_homework(p_student uuid,p_action text,p_until timestamptz) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.v901d_codes%rowtype; c text; found_code boolean; new_id uuid;
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role in ('teacher','admin') and status='active') then raise exception 'Staff required'; end if;
 if not exists(select 1 from public.profiles where id=p_student and role='student' and status='active') then raise exception 'Active student required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_student::text,9012));
 select * into r from public.v901d_codes where student=p_student and mode='homework' order by revoked asc,expires desc,id limit 1 for update;
 found_code:=found;
 if p_action='status' then
  if found_code and not r.revoked then select secret into c from v901d_private.homework_codes where code_id=r.id; end if;
  return jsonb_build_object('exists',found_code,'expires',r.expires,'revoked',r.revoked,'code',c); end if;
 if p_action is null or p_action not in ('issue','reset','extend','revoke') then raise exception 'Invalid action'; end if;
 if p_action<>'revoke' and (p_until is null or p_until<=now() or p_until>now()+interval '366 days') then raise exception 'Expiry must be within 366 days'; end if;
 if p_action='issue' and found_code then raise exception 'Code already exists; use reset'; end if;
 if p_action<>'issue' and not found_code then raise exception 'No code'; end if;
 if p_action='extend' then
  if r.revoked then raise exception 'Code is manually disabled; use reset'; end if;
  update public.v901d_grants set expires=least(expires,p_until) where code_id=r.id;
  update public.v901d_codes set expires=p_until where id=r.id;
 elsif p_action='revoke' then
  delete from v901d_private.homework_codes where code_id in (select id from public.v901d_codes where student=p_student and mode='homework');
  update public.v901d_codes set revoked=true where student=p_student and mode='homework';
 else
  delete from v901d_private.homework_codes where code_id in (select id from public.v901d_codes where student=p_student and mode='homework');
  update public.v901d_codes set revoked=true where student=p_student and mode='homework';
  c:=upper(encode(extensions.gen_random_bytes(12),'hex'));
  insert into public.v901d_codes(student,mode,digest,expires) values(p_student,'homework',encode(extensions.digest(c,'sha256'),'hex'),p_until) returning id into new_id;
  insert into v901d_private.homework_codes(code_id,secret) values(new_id,c);
 end if;
 return jsonb_build_object('ok',true,'code',c);
end;$$;
revoke all on function public.v901d_manage_homework(uuid,text,timestamptz) from public,anon,authenticated;
grant execute on function public.v901d_manage_homework(uuid,text,timestamptz) to authenticated;
create or replace function v901d_private.clear_revoked() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.revoked then delete from v901d_private.homework_codes where code_id=new.id; end if;
 return new;
end;$$;
revoke all on function v901d_private.clear_revoked() from public,anon,authenticated;
drop trigger if exists v901d_clear_revoked on public.v901d_codes;
create trigger v901d_clear_revoked after update of revoked on public.v901d_codes for each row execute function v901d_private.clear_revoked();
commit;
