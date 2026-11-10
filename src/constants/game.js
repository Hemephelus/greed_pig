// Game rules shared with the backend.
// These MUST stay in sync with:
//   Backend/src/controllers/game.controllers.js  (validateCreate)
//   Backend/greedy_pig_schema.sql                (CHECK constraints)
// If the backend changes a limit, change it here too.

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 8;

export const MIN_TARGET = 20;
export const MAX_TARGET = 500;
export const DEFAULT_TARGET = 100;

export const MAX_NAME_LENGTH = 100;

// One die per roll. Rolling this value ends the turn with nothing banked.
export const BUST_FACE = 1;
export const DIE_FACES = 6;

// game_sessions.status
export const GAME_STATUS = Object.freeze({
  IN_PROGRESS: "IN_PROGRESS",
  WON: "WON",
});

// player_powerups.type (not used by the UI yet; see INTEGRATION_TASKS.md T10)
export const POWERUP_TYPES = Object.freeze({
  SHIELD: "SHIELD",
  DOUBLE_UP: "DOUBLE_UP",
  FREEZE: "FREEZE",
  STEAL: "STEAL",
});

// Error codes the frontend reacts to. The backend should send these in
// { success: false, error: { code, message } }.
export const ERROR_CODES = Object.freeze({
  INVALID_INPUT: "INVALID_INPUT",
  NOT_FOUND: "NOT_FOUND",
  GAME_NOT_FOUND: "GAME_NOT_FOUND",
  NOT_YOUR_TURN: "NOT_YOUR_TURN",
  GAME_OVER: "GAME_OVER",
  POWERUP_NOT_FOUND: "POWERUP_NOT_FOUND",
  NETWORK_ERROR: "NETWORK_ERROR",
  CONFIG_ERROR: "CONFIG_ERROR",
  BAD_RESPONSE: "BAD_RESPONSE",
  SERVER_ERROR: "SERVER_ERROR",
});
