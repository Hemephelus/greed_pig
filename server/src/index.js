/* global process */
// starting point for backend

import "dotenv/config";
import express from "express";
import cors from "cors";
import { randomInt } from "node:crypto";
import { supabase } from "./db.js";
import {
  processShieldRoll,
  resolveShieldDecision,
  processShieldPass,
} from "./luckyShield.js";
 
const app = express();
const PORT = process.env.PORT || 4000;
 
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim());
 
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
 
// ---------- Constants ----------
 
const MIN_POINTS = 10;
const MAX_POINTS = 1000;
const DEFAULT_POINTS = 100;
 
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 
// ---------- Helpers ----------
 
//allow error reach error handler instead of server
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Loads a game with its players (ordered by seat) and each player's shield state.
// Returns { error, game }. game is null if not found.
async function fetchGame(id) {
  const { data, error } = await supabase
    .from("games")
    .select("*, game_players!game_players_game_id_fkey(*), game_player_shields(*)")
    .eq("id", id)
    .maybeSingle();
 
  if (error || !data) return { error, game: null };
 
  const shieldsByPlayer = new Map(
    data.game_player_shields.map((s) => [s.player_key, s])
  );
 
  const players = data.game_players
    .sort((a, b) => a.seat_order - b.seat_order)
    .map((p) => {
      const s = shieldsByPlayer.get(p.id);
      return {
        ...p,
        consecutive_rolls: s?.consecutive_rolls ?? 0,
        shields: s?.shields ?? 0,
        pending_decision: s?.pending_decision ?? false,
      };
    });
 
  const game = { ...data, players };
  delete game.game_players;
  delete game.game_player_shields;
  return { error: null, game };
}
 
// Shared checks for roll, pass and shield decision.
// Sends the error response itself and returns null if anything is wrong.
async function loadActionContext(req, res) {
  const { id } = req.params;
  const { playerId } = req.body ?? {};
 
  if (!uuidPattern.test(id)) {
    res.status(400).json({ error: "Invalid game id" });
    return null;
  }
  if (typeof playerId !== "string" || !uuidPattern.test(playerId)) {
    res.status(400).json({ error: "playerId is required" });
    return null;
  }
 
  const { error, game } = await fetchGame(id);
  if (error) {
    console.error("Fetch game failed:", error.message);
    res.status(500).json({ error: "Could not load game." });
    return null;
  }
  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return null;
  }
  if (game.status !== "in_progress") {
    res.status(409).json({ error: "Game is already finished" });
    return null;
  }
 
  const player = game.players.find((p) => p.id === playerId);
  if (!player) {
    res.status(400).json({ error: "Player is not in this game" });
    return null;
  }
  if (game.current_turn_player_id !== playerId) {
    res.status(409).json({ error: "It is not this player's turn" });
    return null;
  }
 
  return { game, player };
}
 
// The next player by seat order, wrapping around after the last seat.
function nextPlayerId(game, currentPlayerId) {
  const index = game.players.findIndex((p) => p.id === currentPlayerId);
  return game.players[(index + 1) % game.players.length].id;
}
 
// Saves the player's new state, the next turn and the winner in one transaction.
// Returns true on success. Sends the error response itself and returns false on failure.
async function saveAction(res, game, updated, nextTurnPlayerId, winnerPlayerId) {
  const { error } = await supabase.rpc("apply_player_update", {
    p_game_id: game.id,
    p_player_id: updated.id,
    p_expected_version: game.version,
    p_total_points: updated.total_points,
    p_running_points: updated.running_points,
    p_consecutive_rolls: updated.consecutive_rolls,
    p_shields: updated.shields,
    p_pending_decision: updated.pending_decision,
    p_next_turn_player_id: nextTurnPlayerId,
    p_winner_player_id: winnerPlayerId,
  });
 
  if (!error) return true;
 
  const message = error.message || "";
  if (message.includes("stale_state")) {
    res.status(409).json({ error: "The game changed. Please try again." });
  } else if (message.includes("not_your_turn")) {
    res.status(409).json({ error: "It is not this player's turn" });
  } else if (message.includes("game_finished")) {
    res.status(409).json({ error: "Game is already finished" });
  } else if (message.includes("game_not_found")) {
    res.status(404).json({ error: "Game not found" });
  } else {
    console.error("Save action failed:", message);
    res.status(500).json({ error: "Could not save the move." });
  }
  return false;
}
 
// Reloads the game and sends it with a description of what just happened.
async function respondWithGame(res, gameId, lastAction) {
  const { game, error } = await fetchGame(gameId);
  if (!game) {
    console.error("Reload game failed:", error?.message);
    return res.status(500).json({ error: "Could not load game." });
  }
  return res.json({ ...game, lastAction });
}

// ---------- Routes ----------
 
// 1. Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});
 
// 2. Create a new game
// Body: { playerNames: string[], maxPoints?: number }
// The old { playerName: string } body still works for a single player.
app.post(
  "/api/games",
  wrap(async (req, res) => {
    const { playerName, playerNames, maxPoints = DEFAULT_POINTS } = req.body ?? {};
 
    const rawNames = Array.isArray(playerNames) ? playerNames : [playerName];
    const names = rawNames.map((n) => (typeof n === "string" ? n.trim() : ""));

  if (names.length === 0 || names.some((n) => n.length === 0)) {
    return res
      .status(400)
      .json({ error: "At least one player name is required" });
  }
  if (names.some((n) => n.length > 30)) {
    return res
      .status(400)
      .json({ error: "Player names must be 30 characters or fewer" });
  }
  if (
    !Number.isInteger(maxPoints) ||
    maxPoints < MIN_POINTS ||
    maxPoints > MAX_POINTS
  ) {
    return res.status(400).json({
      error: `maxPoints must be an integer between ${MIN_POINTS} and ${MAX_POINTS}`,
    });
  }
 
  // player_name keeps the first player's name so the old frontend keeps working.
  const { data: game, error: gameError } = await supabase
    .from("games")
    .insert({ player_name: names[0], max_points: maxPoints })
    .select()
    .single();
 
  if (gameError) {
    console.error("Create game failed:", gameError.message);
    return res
      .status(500)
      .json({ error: "Could not create game. Please try again." });
  }
 
  // The database trigger creates each player's shield row automatically.
  const { data: players, error: playersError } = await supabase
    .from("game_players")
    .insert(
      names.map((player_name, seat_order) => ({
        game_id: game.id,
        player_name,
        seat_order,
      }))
    )
    .select();
 
  if (playersError) {
    console.error("Create players failed:", playersError.message);
    await supabase.from("games").delete().eq("id", game.id); // remove the orphan game
    return res
      .status(500)
      .json({ error: "Could not create game. Please try again." });
  }
 
  const firstPlayer = players.find((p) => p.seat_order === 0);
  const { error: turnError } = await supabase
    .from("games")
    .update({ current_turn_player_id: firstPlayer.id })
    .eq("id", game.id);
 
  if (turnError) {
    console.error("Set first turn failed:", turnError.message);
    await supabase.from("games").delete().eq("id", game.id);
    return res
      .status(500)
      .json({ error: "Could not create game. Please try again." });
  }
 
  const result = await fetchGame(game.id);
  if (!result.game) {
    console.error("Load game failed:", result.error?.message);
    return res.status(500).json({ error: "Could not load game." });
  }
 
  res.status(201).json(result.game);
  })
);
 
// 3. Fetch a game by id
app.get(
  "/api/games/:id",
  wrap(async (req, res) => {
    const { id } = req.params;
 
    if (!uuidPattern.test(id)) {
      return res.status(400).json({ error: "Invalid game id" });
    }
 
    const { error, game } = await fetchGame(id);
 
    if (error) {
      console.error("Fetch game failed:", error.message);
      return res.status(500).json({ error: "Could not load game." });
    }
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
 
    res.json(game);
  })
);
 
// Roll, pass and shield-decision routes go here next.
// 4. Roll the dice
// Body: { playerId }
app.post(
  "/api/games/:id/roll",
  wrap(async (req, res) => {
    const ctx = await loadActionContext(req, res);
    if (!ctx) return;
    const { game, player } = ctx;
 
    if (player.pending_decision) {
      return res
        .status(409)
        .json({ error: "Resolve the shield decision before rolling" });
    }
 
    const diceValue = randomInt(1, 7); // server-generated, 1 to 6
 
    let result;
    try {
      result = processShieldRoll(player, diceValue);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
 
    const updated = result.player;
    const busted = diceValue === 1 && !result.needsDecision;
 
    let nextTurn = player.id; // by default the same player keeps rolling
    let winnerId = null;
 
    if (busted) {
      nextTurn = nextPlayerId(game, player.id);
    } else if (!result.needsDecision) {
      // Win rule: total + running points reach the target (banking is not required)
      if (updated.total_points + updated.running_points >= game.max_points) {
        winnerId = player.id;
      }
    }
 
    const saved = await saveAction(res, game, updated, nextTurn, winnerId);
    if (!saved) return;
 
    return respondWithGame(res, game.id, {
      type: "roll",
      playerId: player.id,
      diceValue,
      busted,
      needsDecision: result.needsDecision,
      earnedShield: result.earnedShield,
      won: winnerId !== null,
    });
  })
);
 
// 5. Pass (bank the running points and end the turn)
// Body: { playerId }
app.post(
  "/api/games/:id/pass",
  wrap(async (req, res) => {
    const ctx = await loadActionContext(req, res);
    if (!ctx) return;
    const { game, player } = ctx;
 
    let updated;
    try {
      updated = processShieldPass(player);
    } catch (err) {
      return res.status(409).json({ error: err.message });
    }
 
    const nextTurn = nextPlayerId(game, player.id);
 
    const saved = await saveAction(res, game, updated, nextTurn, null);
    if (!saved) return;
 
    return respondWithGame(res, game.id, {
      type: "pass",
      playerId: player.id,
      pointsBanked: player.running_points,
    });
  })
);
 
// 6. Resolve a pending shield decision
// Body: { playerId, useShield: boolean }
app.post(
  "/api/games/:id/shield/decision",
  wrap(async (req, res) => {
    const ctx = await loadActionContext(req, res);
    if (!ctx) return;
    const { game, player } = ctx;
 
    if (!player.pending_decision) {
      return res.status(409).json({ error: "No pending shield decision" });
    }
 
    let result;
    try {
      result = resolveShieldDecision(player, req.body?.useShield);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
 
    const nextTurn = nextPlayerId(game, player.id);
 
    const saved = await saveAction(res, game, result.player, nextTurn, null);
    if (!saved) return;
 
    return respondWithGame(res, game.id, {
      type: "shield_decision",
      playerId: player.id,
      useShield: req.body.useShield,
      pointsSaved: result.pointsSaved,
    });
  })
);
 
// ---------- Error handling ----------
 
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong." });
});
 
app.listen(PORT, () => {
  console.log(`Greedy Pig API listening on port ${PORT}`);
});