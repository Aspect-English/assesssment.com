begin;
-- Student code is the source of truth. Existing revoked/inactive accounts remain disabled.
create or replace function public.v901d_sync_homework(p_student uuid) returns void
language plpgsql security definer set search_path='' as $$
declare deadline timestamptz;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_student::text,9012));
 select max(c.expires) into deadline from public.v901d_codes c join public.profiles p on p.id=c.student
 where c.student=p_student and c.mode='homework' and not c.revoked and c.used_at is null and p.role='student' and p.status='active';
 if deadline is null then
  update public.hw_v804_access set enabled=false where user_id=p_student;
 else
  insert into public.hw_v804_access(user_id,valid_until,enabled) values(p_student,deadline,deadline>now())
  on conflict(user_id) do update set valid_until=excluded.valid_until,enabled=excluded.enabled;
 end if;
end;$$;
revoke all on function public.v901d_sync_homework(uuid) from public,anon,authenticated;
create or replace function public.v901d_sync_code_trigger() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op <> 'INSERT' then if old.mode='homework' then perform public.v901d_sync_homework(old.student); end if; end if;
 if tg_op <> 'DELETE' then if new.mode='homework' then perform public.v901d_sync_homework(new.student); end if; end if;
 return null;
end;$$;
revoke all on function public.v901d_sync_code_trigger() from public,anon,authenticated;
drop trigger if exists v901d_sync_code on public.v901d_codes;
create trigger v901d_sync_code after insert or update or delete on public.v901d_codes for each row execute function public.v901d_sync_code_trigger();
-- Legacy UI cannot independently extend entitlement.
create or replace function public.hw_v804_grant_access(p_student uuid,p_until timestamptz) returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role in ('teacher','admin') and status='active') then raise exception 'Staff required'; end if;
 raise exception '請至學生管理設定專屬代碼到期日';
end;$$;
-- Backfill only students with code history; do not enable revoked codes.
select public.v901d_sync_homework(student) from (select distinct student from public.v901d_codes where mode='homework') s;
commit;
