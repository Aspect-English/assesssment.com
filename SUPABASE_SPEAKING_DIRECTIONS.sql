-- speaking_directions 基礎表（若已存在可略過）
create table if not exists public.speaking_directions (
  id uuid primary key default gen_random_uuid(),
  part_number int4 not null unique
    check (part_number between 1 and 5),
  title text,
  directions_text text,
  audio_url text,
  status text not null default 'active'
    check (status in ('active','inactive','draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 建立 Part 1~5
insert into public.speaking_directions (
  part_number,
  title,
  status
)
values
  (1, 'Speaking Part 1 Directions', 'draft'),
  (2, 'Speaking Part 2 Directions', 'draft'),
  (3, 'Speaking Part 3 Directions', 'draft'),
  (4, 'Speaking Part 4 Directions', 'draft'),
  (5, 'Speaking Part 5 Directions', 'draft')
on conflict (part_number) do nothing;
