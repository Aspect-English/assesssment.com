-- Staging first; additive migration, preserves existing records.
begin;
create extension if not exists pgcrypto with schema extensions;
create table if not exists public.v901d_codes(id uuid primary key default gen_random_uuid(), student uuid not null references auth.users(id), mode text not null check(mode in ('exam','homework')), kind text, digest text not null unique, expires timestamptz not null, used_at timestamptz, revoked boolean not null default false);
create table if not exists public.v901d_grants(sid uuid primary key, code_id uuid not null references public.v901d_codes(id), student uuid not null references auth.users(id), expires timestamptz not null, exam_session uuid);
alter table public.v901d_codes enable row level security;
alter table public.v901d_grants enable row level security;
revoke all on public.v901d_codes,public.v901d_grants from anon,authenticated;
create or replace function public.v901d_issue(p_student uuid,p_mode text,p_kind text,p_hours integer) returns text language plpgsql security definer set search_path='' as $$
declare c text;
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role in ('teacher','admin') and status='active') then raise exception 'Staff required'; end if;
 if not exists(select 1 from public.profiles where id=p_student and role='student' and status='active') then raise exception 'Active student required'; end if;
 if p_mode not in ('exam','homework') or p_hours not between 1 and 8760 or (p_mode='exam' and (p_kind is null or p_kind not in ('quick','full','speaking','writing'))) then raise exception 'Invalid settings'; end if;
 if p_mode='homework' then update public.v901d_codes set revoked=true where student=p_student and mode='homework'; end if;
 c:=upper(encode(extensions.gen_random_bytes(12),'hex'));
 insert into public.v901d_codes(student,mode,kind,digest,expires) values(p_student,p_mode,p_kind,encode(extensions.digest(c,'sha256'),'hex'),now()+make_interval(hours=>p_hours)); return c;
end;$$;
revoke all on function public.v901d_issue(uuid,text,text,integer) from public,anon;
grant execute on function public.v901d_issue(uuid,text,text,integer) to authenticated;
create or replace function public.v901d_lookup(p_name text,p_code text,p_mode text) returns jsonb language plpgsql security definer set search_path='' as $$
declare r record;
begin
 select c.id,c.student,c.expires,u.email into r from public.v901d_codes c join public.profiles p on p.id=c.student join auth.users u on u.id=c.student where c.digest=encode(extensions.digest(upper(trim(p_code)),'sha256'),'hex') and trim(p.display_name)=trim(p_name) and p.role='student' and p.status='active' and c.mode=p_mode and not c.revoked and c.expires>now() and c.used_at is null and (c.mode='exam' or exists(select 1 from public.hw_v804_access a where a.user_id=c.student and a.enabled and a.valid_until>now()));
 if not found then return null; end if; return to_jsonb(r);
end;$$;
revoke all on function public.v901d_lookup(text,text,text) from public,anon,authenticated;
grant execute on function public.v901d_lookup(text,text,text) to service_role;
create or replace function public.v901d_access() returns jsonb language plpgsql security definer set search_path='' as $$
declare r record; n text; done jsonb; hw jsonb;
begin
 select c.mode,c.kind,c.used_at,g.exam_session into r from public.v901d_grants g join public.v901d_codes c on c.id=g.code_id where g.sid=(auth.jwt()->>'session_id')::uuid and g.student=auth.uid() and g.expires>now() and not c.revoked;
 if not found then raise exception 'Code session required'; end if;
 select display_name into n from public.profiles where id=auth.uid() and role='student' and status='active'; if n is null then raise exception 'Inactive student'; end if;
 select coalesce(jsonb_agg(distinct test_type),'[]'::jsonb) into done from public.test_sessions where student_account_id=auth.uid() and status='completed';
 select coalesce(jsonb_agg(jsonb_build_object('week',a.set_number,'status',a.status,'due',a.due_at) order by a.set_number),'[]'::jsonb) into hw from public.hw_v804_assignments a where a.student_id=auth.uid() and a.opens_at<=now() and a.status in ('assigned','in_progress') and exists(select 1 from public.hw_v804_access x where x.user_id=auth.uid() and x.enabled and x.valid_until>now());
 return jsonb_build_object('name',n,'mode',r.mode,'kind',case when r.used_at is null then r.kind else null end,'completed',done,'homework',case when r.mode='homework' then hw else '[]'::jsonb end);
end;$$;
revoke all on function public.v901d_access() from public,anon;
grant execute on function public.v901d_access() to authenticated;
create or replace function public.v901_bind_session() returns trigger language plpgsql security definer set search_path='' as $$
declare g record; n text;
begin
 select display_name into n from public.profiles where id=auth.uid() and role='student' and status='active'; if n is null then raise exception 'Active student required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 select x.sid,c.id into g from public.v901d_grants x join public.v901d_codes c on c.id=x.code_id where x.sid=(auth.jwt()->>'session_id')::uuid and x.student=auth.uid() and x.expires>now() and c.expires>now() and c.mode='exam' and c.kind=new.test_type and not c.revoked and c.used_at is null for update of c;
 if not found then raise exception 'Valid unused exam code required'; end if;
 if exists(select 1 from public.test_sessions where student_account_id=auth.uid() and test_type=new.test_type and status='completed') then raise exception 'Test already completed'; end if;
 new.student_account_id:=auth.uid(); new.student_name_snapshot:=n;
 update public.v901d_codes set used_at=now() where id=g.id;
 update public.v901d_grants set exam_session=new.id where sid=g.sid;
 return new;
end;$$;
create or replace function public.v901d_owns(p_id uuid) returns boolean language sql security definer set search_path='' volatile as $$ select exists(select 1 from public.v901d_grants g join public.v901d_codes c on c.id=g.code_id join public.profiles p on p.id=g.student where g.sid=(auth.jwt()->>'session_id')::uuid and g.student=auth.uid() and g.exam_session=p_id and g.expires>now() and not c.revoked and p.role='student' and p.status='active') $$;
revoke all on function public.v901d_owns(uuid) from public,anon;
grant execute on function public.v901d_owns(uuid) to authenticated;
drop policy if exists "Allow student session updates" on public.test_sessions;
drop policy if exists "v901d session update" on public.test_sessions;
create policy "v901d session update" on public.test_sessions for update to authenticated using(public.v901d_owns(id) or public.is_active_staff()) with check(public.v901d_owns(id) or public.is_active_staff());
drop policy if exists "v901d session read" on public.test_sessions;
create policy "v901d session read" on public.test_sessions for select to authenticated using(public.v901d_owns(id));
drop policy if exists "Allow test session inserts" on public.test_sessions;
drop policy if exists "v901d session insert" on public.test_sessions;
create policy "v901d session insert" on public.test_sessions for insert to authenticated with check(student_account_id=auth.uid() and public.v901d_owns(id));
drop policy if exists "Allow response inserts" on public.responses;
drop policy if exists "v901d response insert" on public.responses;
create policy "v901d response insert" on public.responses for insert to authenticated with check(public.v901d_owns(session_id));
create or replace function public.v901d_protect_session() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if public.v901d_owns(old.id) and (new.id is distinct from old.id or new.student_account_id is distinct from old.student_account_id or new.student_id is distinct from old.student_id or new.student_name_snapshot is distinct from old.student_name_snapshot or new.test_type is distinct from old.test_type or new.test_id_text is distinct from old.test_id_text or old.status='completed') then raise exception 'Immutable session identity or completed session'; end if;
 return new;
end;$$;
revoke all on function public.v901d_protect_session() from public,anon,authenticated;
drop trigger if exists v901d_protect_session on public.test_sessions;
create trigger v901d_protect_session before update on public.test_sessions for each row execute function public.v901d_protect_session();
commit;
