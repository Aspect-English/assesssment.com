-- Run in staging first. Existing sessions remain unlinked; no name matching.
begin;
alter table public.test_sessions add column if not exists student_account_id uuid references auth.users(id);
create index if not exists v901_session_student_type_idx on public.test_sessions(student_account_id,test_type,status);
create or replace function public.v901_student_exam_access() returns jsonb language plpgsql security definer set search_path = '' as $$
declare n text; c jsonb;
begin
 select display_name into n from public.profiles where id=auth.uid() and role='student' and status='active';
 if n is null or btrim(n)='' then raise exception 'Active named student required'; end if;
 select coalesce(jsonb_agg(distinct test_type),'[]'::jsonb) into c from public.test_sessions where student_account_id=auth.uid() and status='completed';
 return jsonb_build_object('name',n,'completed',c);
end; $$;
revoke all on function public.v901_student_exam_access() from public, anon;
grant execute on function public.v901_student_exam_access() to authenticated;
create or replace function public.v901_bind_session() returns trigger language plpgsql security definer set search_path = '' as $$
declare n text;
begin
 select display_name into n from public.profiles where id=auth.uid() and role='student' and status='active';
 if n is null or btrim(n)='' then raise exception 'Active named student required'; end if;
 if new.test_type not in ('quick','speaking','writing','full') or new.test_type is null then raise exception 'Invalid test type'; end if;
 if exists(select 1 from public.test_sessions where student_account_id=auth.uid() and test_type=new.test_type and status='completed') then raise exception 'Test already completed'; end if;
 new.student_account_id:=auth.uid(); new.student_name_snapshot:=n;
 return new;
end; $$;
revoke all on function public.v901_bind_session() from public, anon, authenticated;
drop trigger if exists v901_bind_session on public.test_sessions;
create trigger v901_bind_session before insert on public.test_sessions for each row execute function public.v901_bind_session();
commit;
