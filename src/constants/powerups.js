// Power-up constants ("Muddy Pig" set).
// The two numbers below MUST match backend/src/constants.js.
// See POWERUPS_AND_KEYBOARD.md section 2 for the rules.

import { POWERUP_TYPES } from "src/constants/game";

// Bust while holding at least this many turn points to earn one power-up.
export const POWERUP_EARN_MIN_LOST = 10;

// A player can hold at most this many unused power-ups.
export const MAX_POWERUPS_HELD = 3;

// Tray slots 1, 2, 3 use these keys (used by the keyboard shortcut tasks).
export const POWERUP_SHORTCUT_KEYS = ["1", "2", "3"];

// Everything the UI needs to show each power-up. Never hard-code these elsewhere.
export const POWERUP_INFO = Object.freeze({
  [POWERUP_TYPES.TRUFFLE_SNIFF]: {
    label: "Truffle Sniff",
    icon: "🐽",
    shortText: "Is the next roll a 1?",
    needsTarget: false,
    description:
      "Find out whether your next roll will be a 1 (yes or no) before you roll.",
  },
  [POWERUP_TYPES.PIGGY_BANK]: {
    label: "Piggy Bank",
    icon: "🐷",
    shortText: "Bank half, keep rolling",
    needsTarget: false,
    description:
      "Bank half your turn score now (rounded down) and keep rolling with the rest.",
  },
  [POWERUP_TYPES.MUD_BATH]: {
    label: "Mud Bath",
    icon: "🟤",
    shortText: "Next bust keeps half",
    needsTarget: false,
    description:
      "The next time you bust, you keep half your turn score (rounded down).",
  },
  [POWERUP_TYPES.MUDDY_TROTTERS]: {
    label: "Muddy Trotters",
    icon: "🐾",
    shortText: "Halve a rival's next bank",
    needsTarget: true,
    description:
      "Pick another player: their next bank only counts half (rounded down).",
  },
});