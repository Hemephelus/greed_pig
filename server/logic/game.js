import { randomInt } from "node:crypto";

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 8;
export const MIN_POINTS = 25;
export const MAX_POINTS = 1000;

// An error that carries an HTTP status, so routes can answer with the right code.
export class GameError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

// The dice. This is the ONLY place a roll is produced, and it runs on the server.
export function rollDie() {
  return randomInt(1, 7); // 1 to 6
}

// Checks the body of POST /games and returns clean values, or throws a 400.
export function validateNewGame(body) {
  const { players, maxPoints } = body ?? {};

  if (!Array.isArray(players) || players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) {
    throw new GameError(`A game needs between ${MIN_PLAYERS} and ${MAX_PLAYERS} players.`);
  }
  if (!Number.isInteger(maxPoints) || maxPoints < MIN_POINTS || maxPoints > MAX_POINTS) {
    throw new GameError(`Max score must be a whole number between ${MIN_POINTS} and ${MAX_POINTS}.`);
  }

  const cleanPlayers = players.map((p, i) => {
    const raw = typeof p?.name === "string" ? p.name.trim() : "";
    return { name: raw.slice(0, 30) || `Player ${i + 1}` };
  });

  return { players: cleanPlayers, maxPoints };
}

export function createGame({ players, maxPoints }) {
  return {
    maxPoints,
    currentPlayer: 0,
    isGameOver: false,
    winner: null,
    lastRoll: 0,
    players: players.map((p) => ({
      name: p.name,
      running_points: 0,
      total_points: 0,
    })),
  };
}

function assertPlayable(state) {
  if (state.isGameOver) {
    throw new GameError("This game is already over. Start a new one.", 409);
  }
}

// Rules: roll a 1 and you lose this turn's points and the turn passes.
// Any other number is added to your running points. Reach the max score and you win.
// Pure function: returns a NEW state, never edits the one it was given.
export function applyRoll(state, roll) {
  assertPlayable(state);
  if (!Number.isInteger(roll) || roll < 1 || roll > 6) {
    throw new GameError("Invalid dice value.", 500);
  }

  const next = structuredClone(state);
  const player = next.players[next.currentPlayer];
  next.lastRoll = roll;

  if (roll === 1) {
    player.running_points = 0;
    next.currentPlayer = (next.currentPlayer + 1) % next.players.length;
  } else {
    player.running_points += roll;
    if (player.running_points + player.total_points >= next.maxPoints) {
      next.isGameOver = true;
      next.winner = next.currentPlayer;
    }
  }
  return next;
}

// Pass: bank the running points and hand the turn to the next player.
export function applyPass(state) {
  assertPlayable(state);

  const next = structuredClone(state);
  const player = next.players[next.currentPlayer];
  player.total_points += player.running_points;
  player.running_points = 0;
  next.currentPlayer = (next.currentPlayer + 1) % next.players.length;
  return next;
}
