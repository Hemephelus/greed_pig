// Every keyboard shortcut in the game, in one place (POWERUPS_AND_KEYBOARD.md 7.1).
// The shortcut hook, the help overlay and the How To Play page all read this list,
// so a key only ever has to be changed here.
//
// Each entry:
//   key         what event.key looks like, in lower case ("r", "?", "escape")
//   label       what we print on the key cap ("R", "Esc")
//   action      the name of the handler the screen passes to useGameShortcuts
//   description what the key does, for the help overlay and How To Play
//   row         optional: entries with the same row are shown as one line ("1 / 2 / 3")

import { MAX_PLAYERS } from "src/constants/game";
import { POWERUP_SHORTCUT_KEYS } from "src/constants/powerups";

// The picker lists every player except you, so it needs at most MAX_PLAYERS - 1 keys
const TARGET_KEYS = Array.from({ length: MAX_PLAYERS - 1 }, (_, i) => String(i + 1));

export const SHORTCUTS = Object.freeze({
  game: [
    { key: "r", label: "R", action: "roll", description: "Roll the die" },
    { key: "b", label: "B", action: "bank", description: "Bank your turn score (PASS)" },
    ...POWERUP_SHORTCUT_KEYS.map((key, i) => ({
      key,
      label: key,
      action: `usePowerup${i + 1}`,
      description: "Use the power-up in tray slot 1 / 2 / 3",
      row: "powerups",
    })),
    { key: "m", label: "M", action: "toggleSound", description: "Sound on / off" },
    { key: "?", label: "?", action: "toggleHelp", description: "Show / hide the shortcuts help" },
  ],
  help: [
    { key: "escape", label: "Esc", action: "close", description: "Close the shortcuts help", row: "close" },
    { key: "?", label: "?", action: "close", description: "Close the shortcuts help", row: "close" },
  ],
  targetPicker: [
    ...TARGET_KEYS.map((key, i) => ({
      key,
      label: key,
      action: "pickTarget",
      // Which numbered player in the list this key picks (0 = the first one)
      value: i,
      description: "Pick the player with that number",
      row: "targets",
    })),
    { key: "escape", label: "Esc", action: "cancel", description: "Cancel" },
  ],
  gameOver: [
    { key: "n", label: "N", action: "playAgain", description: "Play again (new game)" },
    { key: "h", label: "H", action: "home", description: "Home" },
  ],
});

// The order and titles used when all shortcuts are listed for the player
export const SHORTCUT_GROUPS = Object.freeze([
  { title: "Game screen", shortcuts: SHORTCUTS.game },
  { title: "Shortcuts help", shortcuts: SHORTCUTS.help },
  { title: "Target picker (Muddy Trotters)", shortcuts: SHORTCUTS.targetPicker },
  { title: "Game over", shortcuts: SHORTCUTS.gameOver },
]);