import { getDifficulty } from "src/computer/difficulty";
import { useGameSession } from "src/context/GameSessionContext";

// Words and links for the game-over screen when a computer was playing.
// The winner itself always comes from the server (useGameSession().winner);
// this only decides how to describe that result.
//
// Returns null for a normal pass-and-play game, so GameOver can keep its usual text.
export function useVsComputerResult(champion) {
  const { players } = useGameSession();

  const computer = players.find((p) => p.is_computer);
  if (!computer || !champion) return null;

  // "Hamlet (Medium)" reads better than the seat name "Hamlet (CPU)"
  const level = getDifficulty(computer.difficulty);
  const opponent = level ? `${level.pigName} (${level.label})` : computer.name;

  if (champion.is_computer) {
    return {
      subline: "So close! Try again, or pick an easier pig.",
      playAgainPath: "/live-game/vs-computer",
      playAgainLabel: "Rematch",
      celebrate: false,
    };
  }

  return {
    subline: `You beat ${opponent}!`,
    playAgainPath: "/live-game/vs-computer",
    playAgainLabel: "Play Again",
    celebrate: true,
  };
}