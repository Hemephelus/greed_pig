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
  session: null,     // { id, status, winning_target, active_player_index }
  players: [],       // backend Player objects, ordered by player_index
  avatars: {},       // { [player_index]: pig_index }  (UI only)
  computers: {},     // { [player_index]: difficulty 1–5 } for computer seats (UI only)
  lastRoll: null,    // { dice: 4, bust: false }  (one die)
  message: "",       // latest server message, e.g. "Emmanuel rolled a 9..."
  winner: null,      // raw `winner` from the bank response
  isBusy: false,     // a request is in flight; disable Roll/Bank
  error: null,       // { code, message } of the last failed request
};

export const ACTIONS = Object.freeze({
  REQUEST_STARTED: "REQUEST_STARTED",
  REQUEST_FAILED: "REQUEST_FAILED",
  GAME_LOADED: "GAME_LOADED",
  ROLL_RESOLVED: "ROLL_RESOLVED",
  BANK_RESOLVED: "BANK_RESOLVED",
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
      const session = toSession(action.response);
      return {
        ...state,
        phase: phaseFor(session),
        gameId: session.id,
        session,
        players: byIndex(action.response.players),
        avatars: action.avatars ?? state.avatars,
        computers: action.computers ?? state.computers,
        lastRoll: null,
        message: "",
        winner: null,
        isBusy: false,
        error: null,
      };
    }

    // From POST /roll
    case ACTIONS.ROLL_RESOLVED: {
      const r = action.response;
      return {
        ...state,
        session: toSession(r, state.session),
        players: byIndex(r.players),
        // One die. Also accepts [4] in case the backend sends an array.
        lastRoll: { dice: Array.isArray(r.dice) ? r.dice[0] : r.dice, bust: r.bust },
        message: r.message,
        isBusy: false,
      };
    }

    // From POST /bank
    case ACTIONS.BANK_RESOLVED: {
      const r = action.response;
      const session = {
        ...toSession(r, state.session),
        status: r.game_won ? GAME_STATUS.WON : state.session.status,
      };
      return {
        ...state,
        session,
        phase: phaseFor(session),
        players: byIndex(r.players),
        lastRoll: null,
        message: r.message,
        winner: r.winner,
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
