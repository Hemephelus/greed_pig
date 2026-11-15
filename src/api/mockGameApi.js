// A fake backend that runs in the browser and follows the Backend Guide contract.
// It has the same exports as gameApi.js. Turn it on with VITE_USE_MOCK_API=true.
//
// Why: the real /roll, /bank and /:game_id endpoints are not built yet. With this,
// frontend tasks can be built and tested now. When the backend is ready, set
// VITE_USE_MOCK_API=false and nothing else has to change.
//
// Games are saved in localStorage, so a page refresh keeps the game (test T2 with it).
//
// Power-up rules: POWERUPS_AND_KEYBOARD.md section 2 (the mock must behave like the server).

import { ApiError } from "./gameApi";
import {
  BUST_FACE,
  DIE_FACES,
  ERROR_CODES,
  GAME_STATUS,
  MAX_NAME_LENGTH,
  MAX_PLAYERS,
  MAX_TARGET,
  MIN_PLAYERS,
  MIN_TARGET,
  POWERUP_TYPES,
} from "src/constants/game";
import {
  MAX_POWERUPS_HELD,
  POWERUP_EARN_MIN_LOST,
  POWERUP_INFO,
} from "src/constants/powerups";

const STORAGE_KEY = "greedy-pig:mock-games";
const LATENCY_MS = 200;

// ---------- tiny in-memory "database" ----------

function loadDb() {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}
function saveDb(db) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* storage may be unavailable; the game still works until refresh */
  }
}

const db = loadDb();
let nextPlayerId =
  Object.values(db).flatMap((g) => g.players).reduce((max, p) => Math.max(max, p.id), 0) + 1;
let nextPowerupId =
  Object.values(db)
    .flatMap((g) => g.players)
    .flatMap((p) => p.powerups ?? [])
    .reduce((max, pu) => Math.max(max, pu.id), 0) + 1;

// ---------- helpers ----------

const wait = () => new Promise((r) => setTimeout(r, LATENCY_MS));
const fail = (status, code, message) => {
  throw new ApiError({ code, message }, status);
};
const copy = (v) => JSON.parse(JSON.stringify(v));
const rollDie = () => Math.floor(Math.random() * DIE_FACES) + 1;

function makeRoomId() {
  return "room_" + Math.random().toString(16).slice(2, 10);
}

function getRoom(gameId) {
  const room = db[gameId];
  if (!room) fail(404, ERROR_CODES.GAME_NOT_FOUND, `Game ${gameId} was not found.`);
  return room;
}

function checkTurn(room, playerIndex) {
  if (room.session.status === GAME_STATUS.WON) {
    fail(409, ERROR_CODES.GAME_OVER, "This game is already over.");
  }
  if (playerIndex !== room.session.active_player_index) {
    fail(409, ERROR_CODES.NOT_YOUR_TURN, "It is not this player's turn.");
  }
}

function nextIndex(room) {
  return (room.session.active_player_index + 1) % room.players.length;
}

// Turn passing (guide 2.5): ONE update that moves to the next seat,
// resets "power-up used this turn" and throws away any Truffle Sniff roll.
function advanceTurn(room) {
  room.session.active_player_index = nextIndex(room);
  room.session.powerup_used_this_turn = false;
  room.session.next_die = null;
  return room.players[room.session.active_player_index];
}

// next_die is a secret: it must never leave the "server" (the mock).
function publicSession(session) {
  // eslint-disable-next-line no-unused-vars
  const { next_die, ...rest } = session;
  return rest;
}

// Adds an AVAILABLE power-up to a player's tray and returns it.
function grantPowerup(player, type) {
  const powerup = { id: nextPowerupId++, type };
  player.powerups.push(powerup);
  return powerup;
}

function randomPowerupType() {
  const types = Object.values(POWERUP_TYPES);
  return types[Math.floor(Math.random() * types.length)];
}

// Same shape as Backend/src/utils/formatPlayer.js
function makePlayer(gameId, name, index) {
  return {
    id: nextPlayerId++,
    game_id: gameId,
    player_index: index,
    name,
    total_score: 0,
    turn_score: 0,
    mud_bath_active: false,
    halve_next_bank: false,
    powerups: [],
  };
}

// ---------- endpoints ----------

export async function createGame({ playerNames, winningTarget }) {
  await wait();
  // Mirrors validateCreate() in the backend controller
  if (!Array.isArray(playerNames)) {
    fail(400, ERROR_CODES.INVALID_INPUT, "player_names must be an array of names.");
  }
  if (playerNames.length < MIN_PLAYERS || playerNames.length > MAX_PLAYERS) {
    fail(400, ERROR_CODES.INVALID_INPUT, `A game needs between ${MIN_PLAYERS} and ${MAX_PLAYERS} players.`);
  }
  const names = playerNames.map((n) => (typeof n === "string" ? n.trim() : ""));
  names.forEach((name, i) => {
    if (name.length < 1 || name.length > MAX_NAME_LENGTH) {
      fail(400, ERROR_CODES.INVALID_INPUT, `Player ${i + 1}'s name must be 1 to ${MAX_NAME_LENGTH} characters.`);
    }
  });
  if (!Number.isInteger(winningTarget) || winningTarget < MIN_TARGET || winningTarget > MAX_TARGET) {
    fail(400, ERROR_CODES.INVALID_INPUT, `winning_target must be a whole number between ${MIN_TARGET} and ${MAX_TARGET}.`);
  }

  const gameId = makeRoomId();
  db[gameId] = {
    session: {
      id: gameId,
      status: GAME_STATUS.IN_PROGRESS,
      winning_target: winningTarget,
      active_player_index: 0,
      powerup_used_this_turn: false,
      next_die: null, // private: set by Truffle Sniff, never sent to the frontend
    },
    players: names.map((name, i) => makePlayer(gameId, name, i)),
  };
  saveDb(db);

  return copy({
    success: true,
    game_id: gameId,
    winning_target: winningTarget,
    players: db[gameId].players,
  });
}

export async function getGame(gameId) {
  await wait();
  const room = getRoom(gameId);
  return copy({ success: true, session: publicSession(room.session), players: room.players });
}

export async function roll({ gameId, playerIndex }) {
  await wait();
  const room = getRoom(gameId);
  checkTurn(room, playerIndex);

  const player = room.players[playerIndex];
  // A saved Truffle Sniff roll is used first, then cleared.
  const dice = room.session.next_die ?? rollDie(); // ONE die
  room.session.next_die = null;
  const bust = dice === BUST_FACE;

  let message;
  let mudBathSaved = 0;
  let powerupEarned = null;
  let gameWon = false;

  if (bust) {
    const lost = player.turn_score;
    mudBathSaved = player.mud_bath_active ? Math.floor(lost / 2) : 0;
    player.turn_score = 0;
    player.total_score += mudBathSaved;
    player.mud_bath_active = false; // Mud Bath is used up by the bust

    message = `${player.name} rolled a ${BUST_FACE}. Bust!`;
    if (mudBathSaved > 0) message += ` Mud Bath saved ${mudBathSaved} points.`;

    if (player.total_score >= room.session.winning_target) {
      // Mud Bath's saved points reached the target: the game ends, the turn does not pass.
      gameWon = true;
      room.session.status = GAME_STATUS.WON;
      message += ` ${player.name} wins the game!`;
    } else {
      // Comeback rule: uses the turn score from before the bust.
      if (lost >= POWERUP_EARN_MIN_LOST) {
        if (player.powerups.length < MAX_POWERUPS_HELD) {
          powerupEarned = grantPowerup(player, randomPowerupType());
          message += ` Comeback: earned a ${POWERUP_INFO[powerupEarned.type].label}!`;
        } else {
          message += " Power-up slots are full.";
        }
      }
      const next = advanceTurn(room);
      message += ` It's ${next.name}'s turn.`;
    }
  } else {
    player.turn_score += dice;
    message = `${player.name} rolled a ${dice}. Current turn total: ${player.turn_score}`;
  }
  saveDb(db);

  return copy({
    success: true,
    dice, // a single number 1–6 (see "Roll response" in INTEGRATION_TASKS.md)
    bust,
    mud_bath_saved: mudBathSaved,
    powerup_earned: powerupEarned,
    game_won: gameWon,
    winner: gameWon ? player : null,
    message,
    active_player_index: room.session.active_player_index,
    players: room.players,
  });
}

export async function bank({ gameId, playerIndex }) {
  await wait();
  const room = getRoom(gameId);
  checkTurn(room, playerIndex);

  const player = room.players[playerIndex];
  const turnScore = player.turn_score;

  // Muddy Trotters: only half counts (rounded down), then the flag clears.
  let added = turnScore;
  let halved = false;
  let lostToMud = 0;
  if (player.halve_next_bank) {
    added = Math.floor(turnScore / 2);
    lostToMud = turnScore - added;
    halved = true;
    player.halve_next_bank = false;
  }

  player.total_score += added;
  player.turn_score = 0;

  // The win check happens AFTER halving.
  const gameWon = player.total_score >= room.session.winning_target;
  if (gameWon) {
    room.session.status = GAME_STATUS.WON;
  } else {
    advanceTurn(room);
  }
  saveDb(db);

  const message = halved
    ? `${player.name}'s trotters are muddy! Banked ${added} of ${turnScore} points. Total score: ${player.total_score}`
    : `${player.name} banked ${added} points! Total score: ${player.total_score}`;

  return copy({
    success: true,
    game_won: gameWon,
    // The guide only shows `winner: null`. The mock sends the player object;
    // getWinner() in src/mappers/gameMappers.js accepts object, index or name.
    winner: gameWon ? player : null,
    halved,
    lost_to_mud: lostToMud,
    message,
    active_player_index: room.session.active_player_index,
    players: room.players,
  });
}

// Step 3 of PF1 replaces this stub with the real power-up rules.
export async function applyPowerup() {
  await wait();
  fail(501, "NOT_IMPLEMENTED", "Power-ups are not available in the mock server yet.");
}

// Handy in tests / the browser console: wipes every mock game.
export function resetMockDb() {
  Object.keys(db).forEach((k) => delete db[k]);
  saveDb(db);
}