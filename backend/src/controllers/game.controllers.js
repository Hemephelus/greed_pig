import crypto from "node:crypto";
import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/ApiError.js";
import { formatPlayer } from "../utils/formatPlayer.js";

// Makes a room code like "room_a1b2c3d4"
function makeRoomId() {
  return "room_" + crypto.randomBytes(4).toString("hex");
}

// Validate Request Body
function validateCreate(body) {
  const { player_names, winning_target = 100 } = body || {};

  if (!Array.isArray(player_names)) {
    throw new ApiError(400, "INVALID_INPUT", "player_names must be an array of names.");
  }
  if (player_names.length < 2 || player_names.length > 8) {
    throw new ApiError(400, "INVALID_INPUT", "A game needs between 2 and 8 players.");
  }

  const names = player_names.map((n) => (typeof n === "string" ? n.trim() : ""));
  names.forEach((name, i) => {
    if (name.length < 1 || name.length > 100) {
      throw new ApiError(400, "INVALID_INPUT", `Player ${i + 1}'s name must be 1 to 100 characters.`);
    }
  });

  if (!Number.isInteger(winning_target) || winning_target < 20 || winning_target > 500) {
    throw new ApiError(400, "INVALID_INPUT", "winning_target must be a whole number between 20 and 500.");
  }

  return { names, winning_target };
}

export async function createGame(req, res) {
  const { names, winning_target } = validateCreate(req.body);
  const gameId = makeRoomId();

  // create room
  const { error: sessionError } = await supabase.from("game_sessions").insert({
    id: gameId,
    winning_target,
  });
  if (sessionError) throw sessionError;

  // create player
  const { data: playerRows, error: playersError } = await supabase
    .from("players")
    .insert(names.map((name, index) => ({ game_id: gameId, player_index: index, name })))
    .select()
    .order("player_index", { ascending: true });

  if (playersError) {
    // Don't leave an empty room behind
    await supabase.from("game_sessions").delete().eq("id", gameId);
    throw playersError;
  }

  res.status(201).json({
    success: true,
    game_id: gameId,
    winning_target,
    players: playerRows.map((row) => formatPlayer(row)),
  });
}
