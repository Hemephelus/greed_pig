// Single source of truth for a pass-and-play game that lives on the server.
// Every change comes from a backend response, so the screen can never
// disagree with the database.

import { GAME_STATUS } from "src/constants/game";
import { toSession } from "src/mappers/gameMappers";

export const PHASE = Object.freeze({
  IDLE: "idle",       // no game yet (setup screen)
  LOADING: "loading", // creating or fetching a game
  PLAYING: "playing", // game in progress
  WON: "won",         // someone reached the target
  ERROR: "error",     // could not load a game at all
});

export const initialGameState = {
  phase: PHASE.IDLE,
  gameId: null,
  session: null,     // { id, status, winning_target, active_player_index, powerup_used_this_turn }
  players: [],       // backend Player objects, ordered by player_index
  avatars: {},       // { [player_index]: pig_index }  (UI only)
  computers: {},     // { [player_index]: difficulty 1–5 } for computer seats (UI only)
  lastRoll: null,    // { dice, bust, mud_bath_saved }  (one die)
  lastBank: null,    // { halved, lost_to_mud } from the last bank
  lastPowerupEarned: null, // { id, type } earned on the last bust, or null
  lastPowerupUsed: null,   // { id, type, target_index } from the last power-up use
  sniffResult: null, // { nextRollIsOne: boolean } until the next roll / end of turn
  message: "",       // latest server message
  winner: null,      // raw `winner` from a roll / bank / power-up response
  isBusy: false,     // a request is in flight; disable Roll/Bank/power-ups
  error: null,       // { code, message } of the last failed request
};

export const ACTIONS = Object.freeze({
  REQUEST_STARTED: "REQUEST_STARTED",
  REQUEST_FAILED: "REQUEST_FAILED",
  GAME_LOADED: "GAME_LOADED",
  ROLL_RESOLVED: "ROLL_RESOLVED",
  BANK_RESOLVED: "BANK_RESOLVED",
  POWERUP_RESOLVED: "POWERUP_RESOLVED",
  ERROR_CLEARED: "ERROR_CLEARED",
  GAME_RESET: "GAME_RESET",
});

const phaseFor = (session) =>
  session?.status === GAME_STATUS.WON ? PHASE.WON : PHASE.PLAYING;

const byIndex = (players) => [...players].sort((a, b) => a.player_index - b.player_index);

export function gameSessionReducer(state, action) {
  switch (action.type) {
    case ACTIONS.REQUEST_STARTED:
      return {
        ...state,
        isBusy: true,
        error: null,
        phase: action.loading ? PHASE.LOADING : state.phase,
      };

    case ACTIONS.REQUEST_FAILED:
      return {
        ...state,
        isBusy: false,
        error: { code: action.error.code, message: action.error.message },
        // Only show the full error screen if there is no game to fall back to
        phase: state.session ? state.phase : PHASE.ERROR,
      };

    // From POST /create or GET /:game_id
    case ACTIONS.GAME_LOADED: {
      const base = toSession(action.response);
      const session = {
        ...base,
        powerup_used_this_turn: action.response.session?.powerup_used_this_turn ?? false,
      };
      const canHoldSniff =
        session.status !== GAME_STATUS.WON && session.powerup_used_this_turn === true;
      // The server never sends the sniff answer. Use the one saved on this device
      // (action.sniff) if it is for this game and this turn; otherwise keep the
      // current one on a re-sync of the same game and turn; otherwise none.
      const saved = action.sniff;
      const restored =
        canHoldSniff &&
        saved &&
        saved.gameId === session.id &&
        saved.activePlayerIndex === session.active_player_index
          ? { nextRollIsOne: saved.nextRollIsOne === true }
          : null;
      const sameTurn =
        state.gameId === session.id &&
        state.session?.active_player_index === session.active_player_index;
      return {
        ...state,
        phase: phaseFor(session),
        gameId: session.id,
        session,
        players: byIndex(action.response.players),
        avatars: action.avatars ?? state.avatars,
        computers: action.computers ?? state.computers,
        lastRoll: null,
        lastBank: null,
        lastPowerupEarned: null,
        lastPowerupUsed: null,
        sniffResult: restored ?? (canHoldSniff && sameTurn ? state.sniffResult : null),
        message: "",
        winner: null,
        isBusy: false,
        error: null,
      };
    }

    // From POST /roll
    case ACTIONS.ROLL_RESOLVED: {
      const r = action.response;
      const won = r.game_won === true;
      const session = {
        ...toSession(r, state.session),
        status: won ? GAME_STATUS.WON : state.session.status,
        // A bust passes the turn, which resets the flag (rules 2.5)
        powerup_used_this_turn:
          r.bust && !won ? false : state.session.powerup_used_this_turn,
      };
      return {
        ...state,
        session,
        phase: phaseFor(session),
        players: byIndex(r.players),
        // One die. Also accepts [4] in case the backend sends an array.
        lastRoll: {
          dice: Array.isArray(r.dice) ? r.dice[0] : r.dice,
          bust: r.bust,
          mud_bath_saved: r.mud_bath_saved ?? 0,
        },
        lastBank: null,
        lastPowerupEarned: r.powerup_earned ?? null,
        lastPowerupUsed: null,
        sniffResult: null,
        message: r.message,
        winner: won ? r.winner : state.winner,
        isBusy: false,
      };
    }

    // From POST /bank
    case ACTIONS.BANK_RESOLVED: {
      const r = action.response;
      const won = r.game_won === true;
      const session = {
        ...toSession(r, state.session),
        status: won ? GAME_STATUS.WON : state.session.status,
        powerup_used_this_turn: won ? state.session.powerup_used_this_turn : false,
      };
      return {
        ...state,
        session,
        phase: phaseFor(session),
        players: byIndex(r.players),
        lastRoll: null,
        lastBank: { halved: r.halved === true, lost_to_mud: r.lost_to_mud ?? 0 },
        lastPowerupEarned: null,
        lastPowerupUsed: null,
        sniffResult: null,
        message: r.message,
        winner: r.winner,
        isBusy: false,
      };
    }

    // From POST /powerup/use
    case ACTIONS.POWERUP_RESOLVED: {
      const r = action.response;
      const won = r.game_won === true; // only Piggy Bank can win
      const session = {
        ...toSession(r, state.session),
        status: won ? GAME_STATUS.WON : state.session.status,
        powerup_used_this_turn: r.powerup_used_this_turn ?? true,
      };
      return {
        ...state,
        session,
        phase: phaseFor(session),
        players: byIndex(r.players),
        lastBank: null,
        lastPowerupUsed: r.used ?? null,
        sniffResult:
          r.next_roll_is_one === null || r.next_roll_is_one === undefined
            ? state.sniffResult
            : { nextRollIsOne: r.next_roll_is_one },
        message: r.message,
        winner: won ? r.winner : state.winner,
        isBusy: false,
      };
    }

    case ACTIONS.ERROR_CLEARED:
      return { ...state, error: null };

    case ACTIONS.GAME_RESET:
      return initialGameState;

    default:
      return state;
  }
}