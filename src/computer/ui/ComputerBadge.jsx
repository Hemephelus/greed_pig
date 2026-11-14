/* eslint-disable react/prop-types */
import { getDifficulty } from "src/computer/difficulty";

// A small "🤖 Medium" pill shown next to a computer player's name, so you can
// tell computer seats apart from people at a glance (and see how hard they are).
// Renders nothing for human players, so it is safe to drop in next to any name.
export default function ComputerBadge({ player }) {
  if (!player?.is_computer) return null;

  const level = getDifficulty(player.difficulty);

  return (
    <span
      title={level ? `Computer, level ${level.level}: ${level.label}` : "Computer player"}
      className="sec-font ml-2 inline-block whitespace-nowrap rounded-full border border-[#056FA4] bg-[#056FA440] px-2 py-0.5 align-middle text-xs font-semibold text-white"
    >
      🤖 {level ? level.label : "CPU"}
    </span>
  );
}