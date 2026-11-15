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

// POST /game/powerup/use (guide: POWERUPS_AND_KEYBOARD.md sections 2.4, 2.7 and 3.2/3.3).
// Order of checks matches the real server, so a refused power-up is never used up.
export async function applyPowerup({ gameId, playerIndex, powerupId, targetIndex }) {
  await wait();
  const room = getRoom(gameId);

  if (!Number.isInteger(playerIndex) || playerIndex < 0 || playerIndex >= room.players.length) {
    fail(400, ERROR_CODES.INVALID_INPUT, "player_index must be a valid seat number.");
  }
  if (!Number.isInteger(powerupId) || powerupId < 1) {
    fail(400, ERROR_CODES.INVALID_INPUT, "powerup_id must be a whole number.");
  }
  checkTurn(room, playerIndex);

  if (room.session.powerup_used_this_turn) {
    fail(409, ERROR_CODES.POWERUP_NOT_ALLOWED, "You've already used a power-up this turn.");
  }

  const player = room.players[playerIndex];
  const powerup = player.powerups.find((p) => p.id === powerupId);
  if (!powerup) {
    fail(404, ERROR_CODES.POWERUP_NOT_FOUND, "You don't have that power-up.");
  }

  // Muddy Trotters needs a real target that is not yourself.
  let target = null;
  if (powerup.type === POWERUP_TYPES.MUDDY_TROTTERS) {
    if (
      !Number.isInteger(targetIndex) ||
      targetIndex < 0 ||
      targetIndex >= room.players.length ||
      targetIndex === playerIndex
    ) {
      fail(400, ERROR_CODES.INVALID_INPUT, "Pick another player as the target.");
    }
    target = room.players[targetIndex];
  }

  // "Not allowed" rules (2.4). Checked BEFORE the power-up is used up.
  if (powerup.type === POWERUP_TYPES.PIGGY_BANK && player.turn_score < 2) {
    fail(409, ERROR_CODES.POWERUP_NOT_ALLOWED, "Nothing to bank yet: you need at least 2 turn points.");
  }
  if (powerup.type === POWERUP_TYPES.MUD_BATH && player.mud_bath_active) {
    fail(409, ERROR_CODES.POWERUP_NOT_ALLOWED, "You already have Mud Bath active.");
  }
  if (powerup.type === POWERUP_TYPES.MUDDY_TROTTERS && target.halve_next_bank) {
    fail(409, ERROR_CODES.POWERUP_NOT_ALLOWED, `${target.name}'s trotters are already muddy.`);
  }

  // Use it up straight away (even if the effect comes later).
  player.powerups = player.powerups.filter((p) => p.id !== powerupId);
  room.session.powerup_used_this_turn = true;

  let message;
  let nextRollIsOne = null;
  let gameWon = false;

  switch (powerup.type) {
    case POWERUP_TYPES.TRUFFLE_SNIFF: {
      const next = rollDie();
      room.session.next_die = next; // secret: only next_roll_is_one is ever sent
      nextRollIsOne = next === BUST_FACE;
      message = nextRollIsOne
        ? `${player.name} sniffs for truffles... uh-oh, the next roll is a ${BUST_FACE}!`
        : `${player.name} sniffs for truffles... the next roll is safe!`;
      break;
    }
    case POWERUP_TYPES.PIGGY_BANK: {
      const moved = Math.floor(player.turn_score / 2);
      player.total_score += moved;
      player.turn_score -= moved;
      message = `${player.name} used Piggy Bank: banked ${moved} points, still rolling with ${player.turn_score}. Total score: ${player.total_score}`;
      if (player.total_score >= room.session.winning_target) {
        gameWon = true;
        room.session.status = GAME_STATUS.WON;
        message += ` ${player.name} wins the game!`;
      }
      break;
    }
    case POWERUP_TYPES.MUD_BATH: {
      player.mud_bath_active = true;
      message = `${player.name} jumps in the mud! The next bust keeps half the turn score.`;
      break;
    }
    case POWERUP_TYPES.MUDDY_TROTTERS: {
      target.halve_next_bank = true;
      message = `${player.name} muddied ${target.name}'s trotters! Their next bank only counts half.`;
      break;
    }
    default:
      fail(400, ERROR_CODES.INVALID_INPUT, "Unknown power-up type.");
  }
  saveDb(db);

  return copy({
    success: true,
    used: {
      id: powerup.id,
      type: powerup.type,
      target_index: powerup.type === POWERUP_TYPES.MUDDY_TROTTERS ? targetIndex : null,
    },
    next_roll_is_one: nextRollIsOne,
    game_won: gameWon,
    winner: gameWon ? player : null,
    message,
    active_player_index: room.session.active_player_index,
    powerup_used_this_turn: room.session.powerup_used_this_turn,
    players: room.players,
  });
}

// Handy in tests / the browser console: wipes every mock game.
export function resetMockDb() {
  Object.keys(db).forEach((k) => delete db[k]);
  saveDb(db);
}

// ---------- mock-only test helpers (the real server has test routes instead) ----------

// Gives a player an AVAILABLE power-up. Returns { id, type }.
export function mockGivePowerup(gameId, playerIndex, type) {
  const room = getRoom(gameId);
  const player = room.players[playerIndex];
  if (!player) throw new Error(`No player at index ${playerIndex}.`);
  if (!Object.values(POWERUP_TYPES).includes(type)) {
    throw new Error(`Unknown power-up type: ${type}`);
  }
  if (player.powerups.length >= MAX_POWERUPS_HELD) {
    throw new Error(`${player.name} already holds ${MAX_POWERUPS_HELD} power-ups.`);
  }
  const powerup = grantPowerup(player, type);
  saveDb(db);
  return copy(powerup);
}

// Makes the NEXT roll exactly `value` (like Truffle Sniff does, but without a power-up).
export function mockSetNextDie(gameId, value) {
  const room = getRoom(gameId);
  if (!Number.isInteger(value) || value < 1 || value > DIE_FACES) {
    throw new Error(`value must be a whole number from 1 to ${DIE_FACES}.`);
  }
  room.session.next_die = value;
  saveDb(db);
}

// Dev only: lets you test from the browser console, e.g.
//   const g = await greedyMock.createGame({ playerNames: ["Ada", "Ben"], winningTarget: 100 })
if (import.meta.env.DEV && typeof window !== "undefined") {
  window.greedyMock = {
    createGame,
    getGame,
    roll,
    bank,
    applyPowerup,
    mockGivePowerup,
    mockSetNextDie,
    resetMockDb,
  };
}