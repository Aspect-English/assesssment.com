begin;
create or replace function public.v901d_archive_student(p_student uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role in ('teacher','admin') and status='active') then raise exception 'Staff required'; end if;
 if p_student is null or p_student=auth.uid() then raise exception 'Invalid student'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_student::text,9012));
 update public.profiles set status='inactive' where id=p_student and role='student' and status='active';
 if not found then raise exception 'Active student required'; end if;
 update public.v901d_codes set revoked=true where student=p_student;
 update public.v901d_grants set expires=least(expires,now()) where student=p_student;
 update public.hw_v804_access set enabled=false where user_id=p_student;
end;$$;
revoke all on function public.v901d_archive_student(uuid) from public,anon,authenticated;
grant execute on function public.v901d_archive_student(uuid) to authenticated;
commit;
