// Plays the computer's turns automatically.
//
// Call it ONCE on the game screen (Game.jsx):
//   const computer = useComputerOpponent();
//   computer.isComputerTurn  -> disable the Roll/Bank buttons
//   computer.isThinking      -> show "Snuffles is thinking..."
//   computer.lastMove        -> "ROLL" | "BANK" (for a small caption, optional)
//   computer.difficulty      -> level info of the active computer (label, pigName…)
//   computer.isStalled       -> requests keep failing; show a "Retry" button
//   computer.retry()         -> try again after isStalled
//
// It uses the same roll()/bank() as human players, so the SERVER still rolls the dice.

import { useCallback, useEffect, useState } from "react";
import { PHASE, useGameSession } from "src/context/GameSessionContext";
import {
  COMPUTER_MAX_FAILURES,
  COMPUTER_MOVE_DELAY_MS,
  COMPUTER_TURN_START_DELAY_MS,
  getDifficulty,
} from "./difficulty";
import { decideMove, MOVES } from "./strategy";
import { rollWithAnimation } from "./ui/diceAnimator";

export function useComputerOpponent({ enabled = true } = {}) {
  const { phase, isBusy, activePlayer, players, session, roll, bank } = useGameSession();
  const [isThinking, setIsThinking] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [failures, setFailures] = useState(0);

  const isComputerTurn = phase === PHASE.PLAYING && Boolean(activePlayer?.is_computer);
  const isStalled = failures >= COMPUTER_MAX_FAILURES;

  // Values that change after every move, so the effect plans the next one
  const seat = activePlayer?.player_index;
  const turnScore = activePlayer?.turn_score;
  const totalScore = activePlayer?.total_score;

  useEffect(() => {
    if (!enabled || !isComputerTurn || isBusy || isStalled) {
      setIsThinking(false);
      return undefined;
    }

    setIsThinking(true);
    const delay =
      COMPUTER_MOVE_DELAY_MS + (turnScore === 0 ? COMPUTER_TURN_START_DELAY_MS : 0);

    const timer = setTimeout(async () => {
      const move = decideMove({
        me: activePlayer,
        opponents: players.filter((p) => p.player_index !== seat),
        target: session.winning_target,
        level: activePlayer.difficulty,
      });
      setLastMove(move);
            // A roll goes through the on-screen die so it shuffles and lands like a human's
      const res =
        move === MOVES.ROLL
          ? await rollWithAnimation(() => roll({ byComputer: true }))
          : await bank({ byComputer: true });
      setFailures((n) => (res ? 0 : n + 1));
    }, delay);

    return () => clearTimeout(timer);
    // activePlayer/players/session are read inside; seat + scores tell us when to re-plan
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isComputerTurn, isBusy, isStalled, seat, turnScore, totalScore]);

  const retry = useCallback(() => setFailures(0), []);

  return {
    isComputerTurn,
    isThinking: isComputerTurn && isThinking,
    lastMove,
    difficulty: isComputerTurn ? getDifficulty(activePlayer.difficulty) : null,
    isStalled,
    retry,
  };
}
