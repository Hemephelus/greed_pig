import { useRef, useState } from "react";
import { api } from "src/utils/api";
import { useLiveGameContext } from "src/context/useLiveGameContext";
import { applyServerGame } from "src/utils/live_game/serverGame";

const NO_GAME_MESSAGE = "No game found. Go back to setup and start a new game.";

// Roll, pass and shield decision, all decided by the server.
// Gives back isBusy (a request is running) and error (a message to show).
export default function useServerGameActions() {
  const {
    gameId,
    playerData,
    setPlayerData,
    currentPlayer,
    setCurrentPlayer,
    pendingShieldPlayer,
    setPendingShieldPlayer,
    setIsGameOver,
    setDiceValue,
  } = useLiveGameContext();

  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

  // Keeps the server's roll result until the dice animation finishes
  const rollResult = useRef(null);

  const playerId = playerData[currentPlayer]?.serverId;

  // Puts the server's version of the game on screen
  function showServerGame(game) {
    const next = applyServerGame(playerData, game);
    setPlayerData(next.players);
    setCurrentPlayer(next.currentPlayer);
    setPendingShieldPlayer(next.pendingShieldPlayer);
    if (next.isGameOver) setIsGameOver(true);
  }

  // After an error, reload the game so the screen matches the server again
  async function reloadGame() {
    try {
      showServerGame(await api.getGame(gameId));
    } catch {
      // Keep showing the first error message
    }
  }

  // Starts a roll on the server. Returns the dice value, or null if it failed.
  async function requestRoll() {
    setError("");
    if (!gameId || !playerId) {
      setError(NO_GAME_MESSAGE);
      return null;
    }
    try {
      const game = await api.roll(gameId, playerId);
      rollResult.current = game;
      return game.lastAction.diceValue;
    } catch (err) {
      setError(err.message);
      reloadGame();
      return null;
    }
  }

  // Called when the dice animation stops. Shows the result and returns what happened.
  function finishRoll() {
    const game = rollResult.current;
    rollResult.current = null;
    if (!game) return null;

    setDiceValue(game.lastAction.diceValue);
    showServerGame(game);
    return game.lastAction;
  }

  // Shared steps for pass and shield decision: loading on, request, show result or error
  async function sendAction(makeRequest, id) {
    setError("");
    if (!gameId || !id) {
      setError(NO_GAME_MESSAGE);
      return null;
    }
    setIsBusy(true);
    try {
      const game = await makeRequest(id);
      showServerGame(game);
      return game.lastAction;
    } catch (err) {
      setError(err.message);
      reloadGame();
      return null;
    } finally {
      setIsBusy(false);
    }
  }

  function pass() {
    return sendAction((id) => api.pass(gameId, id), playerId);
  }

  function decideShield(useShield) {
    const id = playerData[pendingShieldPlayer]?.serverId;
    return sendAction((pid) => api.shieldDecision(gameId, pid, useShield), id);
  }

  return { requestRoll, finishRoll, pass, decideShield, isBusy, error };
}
