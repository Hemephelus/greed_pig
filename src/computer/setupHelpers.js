// Builds the player list for a "You vs Computer" game, so the setup screen only
// needs to collect a name, a pig and a difficulty.
//
//   const setupPlayers = buildVsComputerPlayers({ humanName, humanPigIndex, level, pigPetNames });
//   const gameId = await startGame({ setupPlayers, winningTarget });

import { DEFAULT_LEVEL, getDifficulty } from "./difficulty";

export function buildVsComputerPlayers({
  humanName = "",
  humanPigIndex = 0,
  level = DEFAULT_LEVEL,
  computerPigIndex,
  pigPetNames = [],
  humanGoesFirst = true,
}) {
  const human = {
    name: humanName,
    tag: pigPetNames[0] || "Player",
    pig_index: humanPigIndex,
    is_computer: false,
  };
  const computer = {
    // The level's pig name, e.g. "Hamlet (CPU)"
    name: `${getDifficulty(level)?.pigName ?? "Computer"} (CPU)`,
    tag: "Computer",
    // Any pig other than the human's
    pig_index: computerPigIndex ?? (humanPigIndex === level ? level + 1 : level),
    is_computer: true,
    difficulty: level,
  };
  return humanGoesFirst ? [human, computer] : [computer, human];
}

// For the pass-and-play setup screen: a computer seat to push into playerData
// (task C5, optional).
export function makeComputerSeat({ id, pigIndex, tag, level = DEFAULT_LEVEL }) {
  return {
    id,
    avatar: undefined,
    tag,
    name: "",
    pig_index: pigIndex,
    running_points: 0,
    total_points: 0,
    is_computer: true,
    difficulty: level,
  };
}
