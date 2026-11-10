/* eslint-disable react-refresh/only-export-components, react/prop-types */
// Server-backed game state for pass-and-play.
//
// Usage inside any component under /live-game:
// Computer opponents: call useComputerOpponent() (src/computer) on the game screen.
//
//   const { players, activePlayer, session, phase, isBusy, error,
//           startGame, loadGame, roll, bank, clearError, resetGame } = useGameSession();
//
// Every action calls the backend (or the mock) through src/api and stores the
// response. Components never compute scores themselves.

import { createContext, useCallback, useContext, useMemo, useReducer, useRef } from "react";
import * as api from "src/api";
import { RESYNC_CODES } from "src/api";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import { getWinner, toAvatarMap, toComputerMap, toUiPlayer } from "src/mappers/gameMappers";
import {
  ACTIONS,
  PHASE,
  gameSessionReducer,
  initialGameState,
} from "src/state/gameSessionReducer";
import { getActivePlayer, getLeaderboard } from "src/state/selectors";
import { clearCurrentGame, loadCurrentGame, saveCurrentGame } from "src/utils/gameStorage";
import { validateSetup } from "src/utils/validation";

const GameSessionContext = createContext(null);

export function GameSessionProvider({ children }) {
  const [state, dispatch] = useReducer(gameSessionReducer, initialGameState);
  const { preloadSrcList = [] } = useGreedyPigContext() ?? {};

  // Latest state for use inside async callbacks without re-creating them
  const stateRef = useRef(state);
  stateRef.current = state;

  const pigImages = useMemo(
    () => preloadSrcList.filter((src) => src.includes("pig")),
    [preloadSrcList]
  );

  // ---------- internal helpers ----------

  const fetchGame = useCallback(async (gameId, avatars, computers) => {
    const response = await api.getGame(gameId);
    dispatch({ type: ACTIONS.GAME_LOADED, response, avatars, computers });
    return response;
  }, []);

  const handleError = useCallback(
    async (err) => {
      dispatch({ type: ACTIONS.REQUEST_FAILED, error: err });
      // Screen is out of date (e.g. NOT_YOUR_TURN): reload from the server
      const { gameId } = stateRef.current;
      if (gameId && RESYNC_CODES.includes(err.code)) {
        try {
          await fetchGame(gameId);
        } catch {
          /* keep showing the original error */
        }
      }
    },
    [fetchGame]
  );

  // ---------- public actions ----------

  // POST /game/create. Returns the new game_id, or null if it failed.
  const startGame = useCallback(
    async ({ setupPlayers, winningTarget }) => {
      const check = validateSetup({ setupPlayers, winningTarget });
      if (!check.ok) {
        dispatch({
          type: ACTIONS.REQUEST_FAILED,
          error: { code: "INVALID_INPUT", message: check.errors.join(" ") },
        });
        return null;
      }

      dispatch({ type: ACTIONS.REQUEST_STARTED, loading: true });
      try {
        const response = await api.createGame(check.payload);
        const avatars = toAvatarMap(setupPlayers);
        const computers = toComputerMap(setupPlayers);
        dispatch({ type: ACTIONS.GAME_LOADED, response, avatars, computers });
        saveCurrentGame({ gameId: response.game_id, avatars, computers });
        return response.game_id;
      } catch (err) {
        await handleError(err);
        return null;
      }
    },
    [handleError]
  );

  // GET /game/:game_id. Use on page load / refresh / "Resume Game".
  const loadGame = useCallback(
    async (gameId) => {
      const saved = loadCurrentGame();
      const same = saved?.gameId === gameId;
      const avatars = same ? saved.avatars : undefined;
      const computers = same ? saved.computers ?? {} : {};
      dispatch({ type: ACTIONS.REQUEST_STARTED, loading: true });
      try {
        await fetchGame(gameId, avatars, computers);
        return true;
      } catch (err) {
        await handleError(err);
        return false;
      }
    },
    [fetchGame, handleError]
  );

  // POST /game/roll for the active player.
  // Returns the response ({ dice, bust, ... }) so the Dice component
  // can animate to the real values, or null if it failed / was not allowed.
  //
  // Pass { byComputer: true } only from useComputerOpponent. A human click on the
  // computer's turn is ignored, so nobody can play the computer's turn for it.
  const roll = useCallback(async ({ byComputer = false } = {}) => {
    const { session, isBusy, phase, computers } = stateRef.current;
    if (!session || isBusy || phase !== PHASE.PLAYING) return null;
    if (session.active_player_index in computers && byComputer !== true) return null;

    dispatch({ type: ACTIONS.REQUEST_STARTED });
    try {
      const response = await api.roll({
        gameId: session.id,
        playerIndex: session.active_player_index,
      });
      dispatch({ type: ACTIONS.ROLL_RESOLVED, response });
      return response;
    } catch (err) {
      await handleError(err);
      return null;
    }
  }, [handleError]);

  // POST /game/bank for the active player. Returns the response or null.
  const bank = useCallback(async ({ byComputer = false } = {}) => {
    const { session, isBusy, phase, computers } = stateRef.current;
    if (!session || isBusy || phase !== PHASE.PLAYING) return null;
    if (session.active_player_index in computers && byComputer !== true) return null;

    dispatch({ type: ACTIONS.REQUEST_STARTED });
    try {
      const response = await api.bank({
        gameId: session.id,
        playerIndex: session.active_player_index,
      });
      dispatch({ type: ACTIONS.BANK_RESOLVED, response });
      return response;
    } catch (err) {
      await handleError(err);
      return null;
    }
  }, [handleError]);

  const clearError = useCallback(() => dispatch({ type: ACTIONS.ERROR_CLEARED }), []);

  // Forget the current game (e.g. "Start New Game" / "Home" after a win)
  const resetGame = useCallback(() => {
    clearCurrentGame();
    dispatch({ type: ACTIONS.GAME_RESET });
  }, []);

  // ---------- derived, UI-ready data ----------

  const players = useMemo(
    () =>
      state.players.map((p) =>
        toUiPlayer(p, {
          avatars: state.avatars,
          computers: state.computers,
          pigImages,
          activeIndex: state.session?.active_player_index,
        })
      ),
    [state.players, state.avatars, state.computers, state.session, pigImages]
  );

  const value = useMemo(
    () => ({
      // raw state
      phase: state.phase,
      gameId: state.gameId,
      session: state.session,
      lastRoll: state.lastRoll,
      message: state.message,
      isBusy: state.isBusy,
      error: state.error,
      // UI-ready
      players,
      activePlayer: getActivePlayer(players, state.session),
      leaderboard: getLeaderboard(players),
      winner: getWinner(state.winner, players),
      savedGame: loadCurrentGame(),
      // actions
      startGame,
      loadGame,
      roll,
      bank,
      clearError,
      resetGame,
    }),
    [state, players, startGame, loadGame, roll, bank, clearError, resetGame]
  );

  return <GameSessionContext.Provider value={value}>{children}</GameSessionContext.Provider>;
}

export function useGameSession() {
  const ctx = useContext(GameSessionContext);
  if (!ctx) {
    throw new Error("useGameSession must be used inside <GameSessionProvider> (see LivePage.jsx).");
  }
  return ctx;
}

export { PHASE };
