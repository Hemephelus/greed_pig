-- im running this in supabase to create db
create table if not exists public.games (
  id          uuid primary key default gen_random_uuid(),
  player_name text not null check (char_length(player_name) between 1 and 30),
  status      text not null default 'in_progress'
              check (status in ('in_progress', 'finished')),
  created_at  timestamptz not null default now()
);

alter table public.games enable row level security;