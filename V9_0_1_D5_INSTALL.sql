begin;
create or replace function public.v901d_student_code_list() returns table(student_id uuid, expires timestamptz, revoked boolean) language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role in ('teacher','admin') and status='active') then raise exception 'Staff required'; end if;
 return query select distinct on(c.student) c.student,c.expires,c.revoked from public.v901d_codes c join public.profiles p on p.id=c.student where c.mode='homework' and p.role='student' and p.status='active' order by c.student,c.revoked asc,c.expires desc,c.id;
end;$$;
revoke all on function public.v901d_student_code_list() from public,anon,authenticated;
grant execute on function public.v901d_student_code_list() to authenticated;
commit;
