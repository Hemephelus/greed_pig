// TEST-ONLY routes. They make power-up tests exact:
//   POST /api/test/next-die      { game_id, value }               -> the next roll will be `value`
//   POST /api/test/give-powerup  { game_id, player_index, type }  -> gives that player a power-up

import { Router } from "express";
import { supabase } from "../config/supabase.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";
import { POWERUP_TYPES } from "../constants/constants.js";

const router = Router();

function requireGameId(game_id) {
  if (typeof game_id !== "string" || game_id.trim() === "") {
    throw new ApiError(400, "INVALID_INPUT", "game_id is required.");
  }
}

// Sets game_sessions.next_die, so the next roll is exactly `value`
router.post(
  "/next-die",
  asyncHandler(async (req, res) => {
    const { game_id, value } = req.body || {};
    requireGameId(game_id);
    if (!Number.isInteger(value) || value < 1 || value > 6) {
      throw new ApiError(400, "INVALID_INPUT", "value must be a whole number from 1 to 6.");
    }
    const { data, error } = await supabase
      .from("game_sessions")
      .update({ next_die: value })
      .eq("id", game_id)
      .select("id");
    if (error) throw error;
    if (data.length === 0) throw new ApiError(404, "GAME_NOT_FOUND", `Game ${game_id} was not found.`);
    res.json({ success: true, game_id, next_die: value });
  })
);

// Gives a player an AVAILABLE power-up of the given type
router.post(
  "/give-powerup",
  asyncHandler(async (req, res) => {
    const { game_id, player_index, type } = req.body || {};
    requireGameId(game_id);
    if (!Number.isInteger(player_index) || player_index < 0) {
      throw new ApiError(400, "INVALID_INPUT", "player_index must be a whole number, 0 or more.");
    }
    if (!POWERUP_TYPES.includes(type)) {
      throw new ApiError(400, "INVALID_INPUT", `type must be one of: ${POWERUP_TYPES.join(", ")}.`);
    }

    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("id")
      .eq("game_id", game_id)
      .eq("player_index", player_index)
      .maybeSingle();
    if (playerError) throw playerError;
    if (!player) throw new ApiError(404, "GAME_NOT_FOUND", "No player at that seat in that game.");

    const { data, error } = await supabase
      .from("player_powerups")
      .insert({ player_id: player.id, type })
      .select("id, type")
      .single();
    if (error) {
      // The database refuses a 4th power-up (trigger in greedy_pig_schema.sql)
      if (/already holds 3/i.test(error.message || "")) {
        throw new ApiError(409, "POWERUP_NOT_ALLOWED", "That player already holds 3 power-ups.");
      }
      throw error;
    }
    res.status(201).json({ success: true, powerup: data });
  })
);

export default router;
