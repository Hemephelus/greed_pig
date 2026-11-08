import { useRef } from "react";
import { useLiveGameContext } from "src/context/useLiveGameContext";
import { createGame, rollDice, passTurn } from "src/utils/api";
import useAudio from "src/hooks/useAudio";
import addPlayerSound from "src/sound_effect/add_player.mp3";
import loseSound from "src/sound_effect/lose_sound.mp3";
import celebrationSound from "src/sound_effect/celebration.mp3";

// All the game actions (roll, pass) live here so the desktop and mobile
// dice sections share one copy. The rules themselves run on the server.
export default function useGameActions() {
  const {
    playerData,
    setPlayerData,
    maxPoints,
    gameId,
    setGameId,
    setCurrentPlayer,
    setIsGameOver,
    setDiceValue,
    setApiError,
  } = useLiveGameContext();

  const addPlayerAudio = useAudio(addPlayerSound);
  const loseAudio = useAudio(loseSound);
  const celebrationAudio = useAudio(celebrationSound);
  const isPassing = useRef(false);

  // Copy the server's points and turn into the UI state (avatars and names stay local).
  function applyServerState(game) {
    setPlayerData((prev) =>
      prev.map((player, i) => ({
        ...player,
        running_points: game.players[i]?.running_points ?? 0,
        total_points: game.players[i]?.total_points ?? 0,
      }))
    );
    setCurrentPlayer(game.currentPlayer);
  }

  // If the page was refreshed, the game id is gone, so make a new game on the fly.
  async function ensureGameId() {
    if (gameId) return gameId;
    const game = await createGame(playerData, maxPoints);
    setGameId(game.id);
    return game.id;
  }

  function reportError(message) {
    setApiError(message);
  }

  // Called by <Dice /> when the player clicks. The server decides the number.
  async function requestRoll() {
    setApiError("");
    const id = await ensureGameId();
    return rollDice(id);
  }

  // Called by <Dice /> once the rolling animation ends.
  function handleFinalDiceValue({ roll, game }) {
    setDiceValue(roll);
    applyServerState(game);

    if (roll === 1) loseAudio?.play();

    if (game.isGameOver) {
      setTimeout(() => {
        celebrationAudio?.play();
        setIsGameOver(true);
      }, 1000);
    }
  }

  async function handlePass(isRolling) {
    if (isRolling || isPassing.current) return;
    isPassing.current = true;
    setApiError("");
    try {
      const id = await ensureGameId();
      const { game } = await passTurn(id);
      addPlayerAudio?.play();
      applyServerState(game);
    } catch (e) {
      setApiError(e.message);
    } finally {
      isPassing.current = false;
    }
  }

  return { requestRoll, handleFinalDiceValue, handlePass, reportError };
}
