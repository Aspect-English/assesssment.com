-- Execute once in Supabase SQL Editor. Requires existing public.profiles with admin role.
alter table public.test_sessions add column if not exists archived_at timestamptz;
create or replace function public.archive_student_session(p_session_id uuid)
returns void language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  ) then raise exception 'Only active administrators may archive student records'; end if;
  update public.test_sessions set archived_at = now() where id = p_session_id;
  if not found then raise exception 'Session not found'; end if;
end; $$;
revoke all on function public.archive_student_session(uuid) from public;
grant execute on function public.archive_student_session(uuid) to authenticated;
