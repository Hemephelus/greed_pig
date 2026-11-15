/* eslint-disable react/prop-types */
import { MOVES } from "src/computer/strategy";

// Tells the human what the computer is doing on its turn, and offers a Retry
// button if the computer's requests keep failing (for example, the server is down).
// It only displays what useComputerOpponent() reports, so it never changes the game.
export default function ComputerStatus({ computer }) {
  if (!computer?.isComputerTurn) return null;

  const { difficulty, isThinking, isStalled, lastMove, retry } = computer;
  const name = difficulty?.pigName ?? "The computer";
  const level = difficulty ? ` (${difficulty.label})` : "";

  if (isStalled) {
    return (
      <div
        role="alert"
        className="sec-font mx-auto flex w-full max-w-prose items-center justify-between gap-4 rounded-lg border border-[#D30C0C80] bg-[#D30C0C40] p-3 text-white"
      >
        <span>{name} can&apos;t reach the game server.</span>
        <button
          onClick={retry}
          className="rounded bg-[#D30CBD] px-4 py-1 font-bold duration-300 hover:bg-[#d30cbcc0]"
        >
          Retry
        </button>
      </div>
    );
  }

  // lastMove is the move the computer just made, shown under "thinking..."
  const lastMoveText =
    lastMove === MOVES.ROLL ? "chose to roll" : lastMove === MOVES.BANK ? "banked" : null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sec-font mx-auto w-full max-w-prose rounded-lg border border-[#056FA4] bg-[#056FA440] p-3 text-center text-white"
    >
      <p className={isThinking ? "animate-pulse" : ""}>
           {name}
        {level} {isThinking ? "is thinking…" : "is playing…"}
      </p>
      {lastMoveText ? (
        <p className="text-sm text-[#FFEA70]">
          Last move: {name} {lastMoveText}
        </p>
      ) : null}
    </div>
  );
}