import crypto from "node:crypto";
import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/ApiError.js";
import { formatPlayer } from "../utils/formatPlayer.js";
import { POWERUP_TYPES, POWERUP_EARN_MIN_LOST, MAX_POWERUPS_HELD } from "../constants/constants.js";

// "PIGGY_BANK" -> "Piggy Bank" (for messages)
const powerupLabel = (type) =>
  type.split("_").map((w) => w[0] + w.slice(1).toLowerCase()).join(" ");

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

export async function getGame(req, res) {
  const { session, players, powerups } = await loadRoom(req.params.game_id);

  res.json({
    success: true,
    session: {
      id: session.id,
      status: session.status,
      winning_target: session.winning_target,
      active_player_index: session.active_player_index,
    },
    players: players.map((row) => formatPlayer(row, powerups)),
  });
}


async function loadRoom(gameId) {
  const { data: session, error: sessionError } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("id", gameId)
    .maybeSingle();

  if (sessionError) throw sessionError;

  if (!session) {
    throw new ApiError(404, "GAME_NOT_FOUND", `Game ${gameId} was not found.`);
  }

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("*")
    .eq("game_id", gameId)
    .order("player_index", { ascending: true });

  if (playersError) throw playersError;

  let powerups = [];

  if (players.length > 0) {
    const { data, error } = await supabase
      .from("player_powerups")
      .select("*")
      .in("player_id", players.map((p) => p.id))
      .eq("status", "AVAILABLE");

    if (error) throw error;
    powerups = data;
  }

  return { session, players, powerups };
}

// Checks if a Player can play
function assertCanPlay(session, playerIndex) {

  if (session.status === "WON") throw new ApiError(409, "GAME_OVER", `Game ${session.id} has concluded`)

  if (session.active_player_index !== playerIndex) throw new ApiError(409, "NOT_YOUR_TURN", `It's not ${playerIndex + 1}'s turn yet`)

}

// Get next player index
async function advanceTurn(session, players) {
  const next = (session.active_player_index + 1) % players.length;
  const { data, error: sessionError } = await supabase
    .from("game_sessions")
    .update({ active_player_index: next, powerup_used_this_turn: false, next_die: null })
    .eq("id", session.id)
    .eq("active_player_index", session.active_player_index)  // still their turn?
    .select("id");

  if (sessionError) throw sessionError;

  if (data.length === 0) {
    throw new ApiError(409, "NOT_YOUR_TURN", "The turn already moved on.");
  }

  return next;
}

// validate the current turn
function validateTurnBody(body) {
  const { game_id, player_index } = body || {};

  if (typeof game_id !== "string" || game_id.trim() === "" || game_id.length > 50) {
    throw new ApiError(400, "INVALID_INPUT", "game_id must be a game code like room_a1b2c3d4.");
  }

  if (!Number.isInteger(player_index) || player_index < 0) {
    throw new ApiError(400, "INVALID_INPUT", "player_index must be a whole number, 0 or more.");
  }

  return { game_id, player_index };
}

export async function rollDice(req, res) {
  const { game_id, player_index } = validateTurnBody(req.body);       // 400 if bad input
  const { session, players, powerups } = await loadRoom(game_id);     // 404 if no game
  assertCanPlay(session, player_index);                               // 409 if not allowed

  const player = players.find((p) => p.player_index === player_index);

  // A Truffle Sniff powerup check
  const dice = session.next_die ?? crypto.randomInt(1, 7);
  const bust = dice === 1;

  let message;
  let mudBathSaved = 0;
  let powerupEarned = null;
  let gameWon = false;

  if (!bust) {
    // Normal roll: add to this turn's points; the turn does NOT change
    const newTurnScore = player.turn_score + dice;
    const { error } = await supabase
      .from("players")
      .update({ turn_score: newTurnScore })
      .eq("id", player.id);

    if (error) throw error;

    // The sniffed roll has now been used
    if (session.next_die !== null) {
      const { error: dieError } = await supabase
        .from("game_sessions")
        .update({ next_die: null })
        .eq("id", game_id);

      if (dieError) throw dieError;
    }

    message = `${player.name} rolled a ${dice}. Current turn total: ${newTurnScore}`;
  } else {
    // Bust: lose the turn's points, unless Mud Bath saves half
    const lost = player.turn_score;
    mudBathSaved = player.mud_bath_active ? Math.floor(lost / 2) : 0;
    const newTotal = player.total_score + mudBathSaved;

    const { error: playerError } = await supabase
      .from("players")
      .update({ turn_score: 0, total_score: newTotal, mud_bath_active: false }) // Mud Bath is used up
      .eq("id", player.id);

    if (playerError) throw playerError;

    gameWon = newTotal >= session.winning_target;

    const parts = [`${player.name} rolled a 1. Bust!`];

    if (player.mud_bath_active) {
      parts.push(mudBathSaved > 0 ? `Mud Bath saved ${mudBathSaved} points.` : "Mud Bath had nothing to save.");
    }

    if (gameWon) {
      // Mud Bath pushed them over the target: they win, and the turn doesn't pass
      const { error: wonError } = await supabase
        .from("game_sessions")
        .update({ status: "WON", next_die: null })
        .eq("id", game_id);
      if (wonError) throw wonError;
      parts.push(`${player.name} wins with ${newTotal}!`);
    } else {
      // Comeback: busting with 10+ turn points earns a power-up (max 3 held)
      if (lost >= POWERUP_EARN_MIN_LOST) {
        const held = powerups.filter((p) => p.player_id === player.id).length; // loadRoom returns AVAILABLE ones

        if (held < MAX_POWERUPS_HELD) {
          const type = POWERUP_TYPES[crypto.randomInt(POWERUP_TYPES.length)];

          const { data, error: powerupError } = await supabase
            .from("player_powerups")
            .insert({ player_id: player.id, type })
            .select("id, type")
            .single();

          if (powerupError) throw powerupError;

          powerupEarned = data;
          parts.push(`Comeback: earned a ${powerupLabel(type)}!`);
        } else {
          parts.push("Power-up slots are full.");
        }
      }

      const next = await advanceTurn(session, players); // also resets the power-up flag and next_die
      const nextPlayer = players.find((p) => p.player_index === next);
      parts.push(`It's ${nextPlayer.name}'s turn.`);
    }
    message = parts.join(" ");
  }

  const updated = await loadRoom(game_id);
  const formattedPlayers = updated.players.map((row) => formatPlayer(row, updated.powerups));

  res.json({
    success: true,
    dice,
    bust,
    mud_bath_saved: mudBathSaved,
    powerup_earned: powerupEarned,
    game_won: gameWon,
    winner: gameWon ? formattedPlayers.find((p) => p.player_index === player_index) : null,
    message,
    active_player_index: updated.session.active_player_index,
    players: formattedPlayers,
  });
}

export async function bankScore(req, res) {
  const { game_id, player_index } = validateTurnBody(req.body); // 400 if bad input
  const { session, players } = await loadRoom(game_id);          // 404 if no game
  assertCanPlay(session, player_index);                          // 409 if not allowed

  const player = players.find((p) => p.player_index === player_index);
  const turnScore = player.turn_score;

  // Muddy Trotters: this bank only counts half (rounded down); the rest is lost
  const halved = player.halve_next_bank;
  const added = halved ? Math.floor(turnScore / 2) : turnScore;
  const lostToMud = turnScore - added;
  const newTotal = player.total_score + added;

  const { error: playerError } = await supabase
    .from("players")
    .update({ total_score: newTotal, turn_score: 0, halve_next_bank: false }) // muddy trotters clear on any bank
    .eq("id", player.id);
  if (playerError) throw playerError;

  // Win check AFTER halving
  const gameWon = newTotal >= session.winning_target;

  if (gameWon) {
    // Turn stays on the winner; throw away any sniffed roll
    const { error: sessionError } = await supabase
      .from("game_sessions")
      .update({ status: "WON", next_die: null })
      .eq("id", game_id);
    if (sessionError) throw sessionError;
  } else {
    await advanceTurn(session, players); // also resets the power-up flag and next_die
  }

  const banked = halved
    ? `${player.name}'s trotters are muddy! Banked ${added} of ${turnScore} points.`
    : `${player.name} banked ${added} points!`;
  const message = gameWon
    ? `${banked} ${player.name} wins with ${newTotal}!`
    : `${banked} Total score: ${newTotal}`;

  // Reload so the reply has the up-to-date scores and turn
  const updated = await loadRoom(game_id);
  const formattedPlayers = updated.players.map((row) => formatPlayer(row, updated.powerups));

  res.json({
    success: true,
    game_won: gameWon,
    winner: gameWon ? formattedPlayers.find((p) => p.player_index === player_index) : null,
    halved,
    lost_to_mud: lostToMud,
    message,
    active_player_index: updated.session.active_player_index,
    players: formattedPlayers,
  });
}
