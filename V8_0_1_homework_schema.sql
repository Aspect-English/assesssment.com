-- Aspect TOEIC SW V8.0.1: additive schema only. Run in Supabase SQL Editor after backup.
-- No existing tables are modified. RLS enabled and no public grants/policies.
create extension if not exists pgcrypto;

create table if not exists public.hw_sets (
 id uuid primary key default gen_random_uuid(),
 set_number integer not null unique check (set_number between 1 and 15),
 title text not null,
 status text not null default 'draft' check(status in ('draft','published','archived')),
 opens_at timestamptz, due_at timestamptz,
 created_at timestamptz not null default now(),
 check (due_at is null or opens_at is null or due_at > opens_at)
);
create table if not exists public.hw_part_rules (
 id uuid primary key default gen_random_uuid(),
 set_id uuid not null references public.hw_sets(id) on delete cascade,
 section_type text not null check(section_type in ('speaking','writing')),
 part_number integer not null check(part_number between 1 and 5),
 question_count integer not null check(question_count > 0),
 unique(set_id,section_type,part_number),
 check (section_type <> 'writing' or part_number <= 3)
);
-- pool rows link to existing question_bank IDs as text until production ID type is verified.
create table if not exists public.hw_question_pool (
 id uuid primary key default gen_random_uuid(),
 question_bank_id text not null unique,
 section_type text not null check(section_type in ('speaking','writing')),
 part_number integer not null check(part_number between 1 and 5),
 group_key text, -- shared stimulus / bundle identifier
 enabled boolean not null default true,
 check(section_type <> 'writing' or part_number <= 3)
);
create table if not exists public.hw_entitlements (
 student_id uuid primary key references auth.users(id) on delete cascade,
 status text not null default 'active' check(status in ('active','paused','terminated')),
 valid_from timestamptz not null default now(),
 valid_until timestamptz,
 updated_at timestamptz not null default now(),
 check(valid_until is null or valid_until > valid_from)
);
create table if not exists public.hw_assignments (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references auth.users(id) on delete cascade,
 set_id uuid not null references public.hw_sets(id),
 status text not null default 'assigned' check(status in ('assigned','in_progress','submitted','reviewed','cancelled')),
 assigned_at timestamptz not null default now(),
 started_at timestamptz, submitted_at timestamptz,
 unique(student_id,set_id), unique(id,student_id)
);
create table if not exists public.hw_allocations (
 id uuid primary key default gen_random_uuid(),
 assignment_id uuid not null,
 student_id uuid not null,
 pool_id uuid not null references public.hw_question_pool(id),
 position integer not null check(position > 0),
 allocated_at timestamptz not null default now(),
 foreign key (assignment_id,student_id) references public.hw_assignments(id,student_id) on delete cascade,
 unique(assignment_id,position),
 unique(student_id,pool_id)
);
create table if not exists public.hw_answers (
 id uuid primary key default gen_random_uuid(),
 allocation_id uuid not null unique references public.hw_allocations(id) on delete cascade,
 answer_text text,
 recording_path text,
 transcript text,
 saved_at timestamptz not null default now(),
 submitted_at timestamptz
);
create table if not exists public.hw_reviews (
 id uuid primary key default gen_random_uuid(),
 allocation_id uuid not null unique references public.hw_allocations(id) on delete cascade,
 rubric jsonb not null default '{}'::jsonb,
 score numeric,
 corrected_text text,
 feedback text,
 reviewed_by uuid references auth.users(id),
 reviewed_at timestamptz
);
create table if not exists public.hw_audit_logs (
 id bigint generated always as identity primary key,
 actor_id uuid references auth.users(id),
 student_id uuid references auth.users(id),
 action text not null,
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists hw_allocations_student_idx on public.hw_allocations(student_id);
create index if not exists hw_assignments_student_status_idx on public.hw_assignments(student_id,status);
create index if not exists hw_pool_part_idx on public.hw_question_pool(section_type,part_number,enabled);
-- Defense in depth: no access until reviewed policies / secure server functions are installed.
alter table public.hw_sets enable row level security;
alter table public.hw_part_rules enable row level security;
alter table public.hw_question_pool enable row level security;
alter table public.hw_entitlements enable row level security;
alter table public.hw_assignments enable row level security;
alter table public.hw_allocations enable row level security;
alter table public.hw_answers enable row level security;
alter table public.hw_reviews enable row level security;
alter table public.hw_audit_logs enable row level security;
-- Create exactly 15 draft sets; safe to rerun.
insert into public.hw_sets(set_number,title)
select n, 'Homework ' || lpad(n::text,2,'0') from generate_series(1,15) n
on conflict(set_number) do nothing;
