
-- Lucky Shield feature
-- Each player can own one shield per game.

CREATE TABLE IF NOT EXISTS public.game_player_shields (
    game_id UUID NOT NULL
        REFERENCES public.games(id)
        ON DELETE CASCADE,

    player_key TEXT NOT NULL,

    consecutive_rolls INTEGER NOT NULL DEFAULT 0
        CHECK (consecutive_rolls BETWEEN 0 AND 5),

    shields INTEGER NOT NULL DEFAULT 0
        CHECK (shields BETWEEN 0 AND 1),

    pending_decision BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (game_id, player_key),

    CHECK (length(trim(player_key)) > 0)
);

-- Prevent direct client access to shield state.
-- Access must go through authorized server endpoints.
ALTER TABLE public.game_player_shields
ENABLE ROW LEVEL SECURITY;
