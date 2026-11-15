/* eslint-disable react/prop-types */
import { useComputerTurnRecap } from "./useComputerTurnRecap";

// Shows what the computer just did, in the server's own words
// (e.g. "Hamlet (CPU) banked 22 points!" or "... rolled a 1. Bust!").
// It stays visible after the turn passes to you, until you make your own move.
export default function ComputerTurnRecap({ computer }) {
  const recap = useComputerTurnRecap(Boolean(computer?.isComputerTurn));

  // The Retry box in ComputerStatus is more important than an old recap
  if (!recap || computer?.isStalled) return null;

  const colours = recap.bust
    ? "border-[#E71D36] bg-[#E71D3630]"
    : "border-[#ffffff40] bg-[#ffffff20]";

  return (
    <p
      aria-live="polite"
      className={`sec-font mx-auto w-full max-w-prose rounded-lg border p-2 text-center text-sm text-white md:text-base ${colours}`}
    >
      {recap.bust ? "💥 " : "🐷 "}
      {recap.text}
    </p>
  );
}