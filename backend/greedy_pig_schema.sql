-- =============================================================
-- Greedy Pig Reimagined: Supabase PostgreSQL schema
-- Paste into Supabase: SQL Editor -> New query -> Run
-- Safe to run more than once (uses IF NOT EXISTS).
-- =============================================================


-- -------------------------------------------------------------
-- 1. game_sessions: one row per game room
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS game_sessions (
  id                      VARCHAR(50)  PRIMARY KEY,               -- e.g. 'room_abc123'
  status                  VARCHAR(20)  NOT NULL DEFAULT 'IN_PROGRESS'
                          CHECK (status IN ('IN_PROGRESS', 'WON')),
  winning_target          INTEGER      NOT NULL DEFAULT 100
                          CHECK (winning_target BETWEEN 20 AND 500),
  active_player_index     INTEGER      NOT NULL DEFAULT 0,
  powerup_used_this_turn  BOOLEAN      NOT NULL DEFAULT false,      -- NEW
  created_at              TIMESTAMP    NOT NULL DEFAULT NOW()
);


-- -------------------------------------------------------------
-- 2. players: one row per player in a room
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS players (
  id              SERIAL        PRIMARY KEY,
  game_id         VARCHAR(50)   NOT NULL
                  REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_index    INTEGER       NOT NULL CHECK (player_index >= 0),
  name            VARCHAR(100)  NOT NULL CHECK (char_length(name) >= 1),
  total_score     INTEGER       NOT NULL DEFAULT 0,
  turn_score      INTEGER       NOT NULL DEFAULT 0,
  shield_active   BOOLEAN       NOT NULL DEFAULT false,   -- NEW
  double_active   BOOLEAN       NOT NULL DEFAULT false,   -- NEW
  skip_next_turn  BOOLEAN       NOT NULL DEFAULT false,   -- NEW
  UNIQUE (game_id, player_index)                          -- no two players share a seat
);


-- -------------------------------------------------------------
-- 3. player_powerups (NEW): one row per power-up earned
--    Rows are kept after use for history.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS player_powerups (
  id          SERIAL       PRIMARY KEY,                   -- sent by frontend as powerup_id
  player_id   INTEGER      NOT NULL
              REFERENCES players(id) ON DELETE CASCADE,
  type        VARCHAR(20)  NOT NULL
              CHECK (type IN ('SHIELD', 'DOUBLE_UP', 'FREEZE', 'STEAL')),
  status      VARCHAR(20)  NOT NULL DEFAULT 'AVAILABLE'
              CHECK (status IN ('AVAILABLE', 'USED')),
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
  used_at     TIMESTAMP    NULL
);


-- -------------------------------------------------------------
-- Migration: if game_sessions / players already existed before
-- the power-up feature, these lines add the NEW columns.
-- (They do nothing if the columns are already there.)
-- -------------------------------------------------------------
ALTER TABLE game_sessions
  ADD COLUMN IF NOT EXISTS powerup_used_this_turn BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE players
  ADD COLUMN IF NOT EXISTS shield_active  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS double_active  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS skip_next_turn BOOLEAN NOT NULL DEFAULT false;


-- -------------------------------------------------------------
-- Indexes for the lookups the API does most
-- -------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_players_game_id
  ON players (game_id);

CREATE INDEX IF NOT EXISTS idx_powerups_player_available
  ON player_powerups (player_id)
  WHERE status = 'AVAILABLE';


-- -------------------------------------------------------------
-- Safety net: max 3 AVAILABLE power-ups per player.
-- The server should already check this before inserting;
-- this trigger just stops bad data if it ever slips through.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_powerup_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'AVAILABLE' AND (
       SELECT COUNT(*) FROM player_powerups
       WHERE player_id = NEW.player_id
         AND status = 'AVAILABLE'
         AND id IS DISTINCT FROM NEW.id
     ) >= 3 THEN
    RAISE EXCEPTION 'Player % already holds 3 available power-ups', NEW.player_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_powerup_limit ON player_powerups;
CREATE TRIGGER trg_powerup_limit
  BEFORE INSERT OR UPDATE ON player_powerups
  FOR EACH ROW EXECUTE FUNCTION enforce_powerup_limit();


-- -------------------------------------------------------------
-- Row Level Security
-- Turned on with no policies = the public/anon key can't touch
-- these tables. Your backend uses the SERVICE ROLE key, which
-- bypasses RLS, so the server still has full access.
-- -------------------------------------------------------------
ALTER TABLE game_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE players         ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_powerups ENABLE ROW LEVEL SECURITY;
