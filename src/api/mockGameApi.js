// A fake backend that runs in the browser and follows the Backend Guide contract.
// It has the same exports as gameApi.js. Turn it on with VITE_USE_MOCK_API=true.
//
// Why: the real /roll, /bank and /:game_id endpoints are not built yet. With this,
// frontend tasks can be built and tested now. When the backend is ready, set
// VITE_USE_MOCK_API=false and nothing else has to change.
//
// Games are saved in localStorage, so a page refresh keeps the game (test T2 with it).

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
} from "src/constants/game";

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

// Same shape as Backend/src/utils/formatPlayer.js
function makePlayer(gameId, name, index) {
  return {
    id: nextPlayerId++,
    game_id: gameId,
    player_index: index,
    name,
    total_score: 0,
    turn_score: 0,
    shield_active: false,
    double_active: false,
    skip_next_turn: false,
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
  return copy({ success: true, session: room.session, players: room.players });
}

export async function roll({ gameId, playerIndex }) {
  await wait();
  const room = getRoom(gameId);
  checkTurn(room, playerIndex);

  const player = room.players[playerIndex];
  const dice = rollDie(); // ONE die
  const bust = dice === BUST_FACE;
  let message;

  if (bust) {
    player.turn_score = 0;
    room.session.active_player_index = nextIndex(room);
    const next = room.players[room.session.active_player_index];
    message = `${player.name} rolled a ${BUST_FACE}. Bust! It's ${next.name}'s turn.`;
  } else {
    player.turn_score += dice;
    message = `${player.name} rolled a ${dice}. Current turn total: ${player.turn_score}`;
  }
  saveDb(db);

  return copy({
    success: true,
    dice, // a single number 1–6 (see "Roll response" in INTEGRATION_TASKS.md)
    bust,
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
  const banked = player.turn_score;
  player.total_score += banked;
  player.turn_score = 0;

  const gameWon = player.total_score >= room.session.winning_target;
  if (gameWon) {
    room.session.status = GAME_STATUS.WON;
  } else {
    room.session.active_player_index = nextIndex(room);
  }
  saveDb(db);

  return copy({
    success: true,
    game_won: gameWon,
    // The guide only shows `winner: null`. The mock sends the player object;
    // getWinner() in src/mappers/gameMappers.js accepts object, index or name.
    winner: gameWon ? player : null,
    message: `${player.name} banked ${banked} points! Total score: ${player.total_score}`,
    active_player_index: room.session.active_player_index,
    players: room.players,
  });
}

export async function applyPowerup() {
  await wait();
  fail(501, "NOT_IMPLEMENTED", "Power-ups are not available in the mock server yet.");
}

// Handy in tests / the browser console: wipes every mock game.
export function resetMockDb() {
  Object.keys(db).forEach((k) => delete db[k]);
  saveDb(db);
}
