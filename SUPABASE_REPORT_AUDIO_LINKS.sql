-- V7.8: run in Supabase SQL Editor after backing up the database.
create table if not exists public.report_audio_links (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  response_id uuid not null references public.responses(id) on delete cascade,
  kind text not null check (kind in ('student', 'question')),
  bucket text,
  object_path text,
  public_url text,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_by uuid not null,
  created_at timestamptz not null default now()
);
create index if not exists report_audio_links_response_idx on public.report_audio_links(response_id);
alter table public.report_audio_links enable row level security;
-- No public RLS policies: only the service-role Edge Function can read/write tokens.
-- To revoke one link, set revoked_at=now() using its id. To revoke all links for a response:
-- update public.report_audio_links set revoked_at=now() where response_id='RESPONSE_UUID';
