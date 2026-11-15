-- table alteration

-- 1. Extend games
alter table public.games alter column player_name drop not null;  -- players now live in game_players
alter table public.games
  add column max_points integer not null default 100
  check (max_points between 10 and 1000),
  add column current_turn_player_id uuid,
  add column winner_player_id uuid,
  add column version integer not null default 0;

-- 2. Players per game
create table public.game_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  player_name text not null check (char_length(player_name) between 1 and 30),
  seat_order integer not null check (seat_order >= 0),
  total_points integer not null default 0,
  running_points integer not null default 0,
  created_at timestamptz not null default now(),
  unique (game_id, seat_order)
);

alter table public.games
  add constraint games_current_turn_fk foreign key (current_turn_player_id)
    references public.game_players(id) on delete set null,
  add constraint games_winner_fk foreign key (winner_player_id)
    references public.game_players(id) on delete set null;

-- 3. Auto-create a shield row for each new player (player_key = game_players.id as text)
create function public.create_shield_row() returns trigger
language plpgsql as $$
begin
  insert into public.game_player_shields (game_id, player_key, consecutive_rolls, shields, pending_decision)
  values (new.game_id, new.id::text, 0, 0, false)
  on conflict do nothing;
  return new;
end $$;

create trigger game_players_create_shield
after insert on public.game_players
for each row execute function public.create_shield_row();

-- 4. Atomic save used by roll, pass and shield-decision endpoints
create or replace function public.apply_player_update(
  p_game_id uuid,
  p_player_id uuid,
  p_expected_version integer,
  p_total_points integer,
  p_running_points integer,
  p_consecutive_rolls integer,
  p_shields integer,
  p_pending_decision boolean,
  p_next_turn_player_id uuid,
  p_winner_player_id uuid default null
) returns void
language plpgsql as $$
declare g public.games%rowtype;
begin
  select * into g from public.games where id = p_game_id for update;
  if not found then raise exception 'game_not_found'; end if;
  if g.status <> 'in_progress' then raise exception 'game_finished'; end if;
  if g.version <> p_expected_version then raise exception 'stale_state'; end if;
  if g.current_turn_player_id is distinct from p_player_id then raise exception 'not_your_turn'; end if;

  update public.game_players
     set total_points = p_total_points, running_points = p_running_points
   where id = p_player_id and game_id = p_game_id;

  update public.game_player_shields
     set consecutive_rolls = p_consecutive_rolls, shields = p_shields, pending_decision = p_pending_decision
   where game_id = p_game_id and player_key = p_player_id::text;

  update public.games
     set current_turn_player_id = p_next_turn_player_id,
         winner_player_id = p_winner_player_id,
         status = case when p_winner_player_id is null then 'in_progress' else 'finished' end,
         version = version + 1
   where id = p_game_id;
end $$;

revoke execute on function public.apply_player_update from public, anon, authenticated;
grant execute on function public.apply_player_update to service_role;