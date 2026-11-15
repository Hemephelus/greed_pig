import { useEffect, useRef, useState } from "react";
import { useGameSession } from "src/context/GameSessionContext";

// Keeps the server's message about the computer's latest move on screen.
// Without this, the computer's turn can end (bank or bust) before the human has
// seen what happened, because the status box disappears as soon as the turn passes.
//
// A message "belongs" to the computer when it arrives as the answer to a move made
// while it was the computer's turn. It stays until a human move replaces it.
// We only display the server's text; nothing here works out scores or dice.
export function useComputerTurnRecap(isComputerTurn) {
  const { message, lastRoll } = useGameSession();
  const [recap, setRecap] = useState(null);

  // What the previous render saw. The server reply that ends the computer's turn
  // switches the active player and sets the message in the same update, so we need
  // to remember who was playing just before it.
  const previous = useRef({ message, isComputerTurn });

  useEffect(() => {
    const before = previous.current;
    previous.current = { message, isComputerTurn };

    if (message === before.message) return;

    if (message && before.isComputerTurn) {
      setRecap({ text: message, bust: Boolean(lastRoll?.bust) });
    } else {
      setRecap(null);
    }
  }, [message, isComputerTurn, lastRoll]);

  return recap;
}