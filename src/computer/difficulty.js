// The five computer difficulty levels. The UI (setup cards, badges) reads from here,
// so names and descriptions only need changing in one place.

export const DIFFICULTY_LEVELS = Object.freeze([
  {
    level: 1,
    key: "VERY_EASY",
    label: "Very Easy",
    pigName: "Piglet",
    description: "Flips a coin to decide. Sometimes even forgets to bank a win.",
  },
  {
    level: 2,
    key: "EASY",
    label: "Easy",
    pigName: "Snuffles",
    description: "Plays it safe: banks at 10 points, and makes the odd silly choice.",
  },
  {
    level: 3,
    key: "MEDIUM",
    label: "Medium",
    pigName: "Hamlet",
    description: "Steady player: banks at 20 points, the best simple rule for one die.",
  },
  {
    level: 4,
    key: "HARD",
    label: "Hard",
    pigName: "Boar",
    description: "Watches the scoreboard: takes more risks when behind, plays safer when ahead.",
  },
  {
    level: 5,
    key: "EXPERT",
    label: "Expert",
    pigName: "Greedy King",
    description: "Thinks like a pro: reads the scoreboard and goes all-in when you're about to win.",
  },
]);

export const MIN_LEVEL = 1;
export const MAX_LEVEL = DIFFICULTY_LEVELS.length;
export const DEFAULT_LEVEL = 3;

export function getDifficulty(level) {
  return DIFFICULTY_LEVELS.find((d) => d.level === level) ?? null;
}

export function isValidLevel(level) {
  return Number.isInteger(level) && level >= MIN_LEVEL && level <= MAX_LEVEL;
}

// How long the computer "thinks" before each move, so players can follow along.
export const COMPUTER_MOVE_DELAY_MS = 1000;
// Extra pause at the start of the computer's turn
export const COMPUTER_TURN_START_DELAY_MS = 600;
// Stop trying after this many failed requests in a row (e.g. server down)
export const COMPUTER_MAX_FAILURES = 3;
