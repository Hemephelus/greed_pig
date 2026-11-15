import { useEffect, useRef } from "react";

// Listens for one screen's keyboard shortcuts and calls the matching handler.
//
//   useGameShortcuts(SHORTCUTS.game, { roll, bank, ... }, { enabled });
//
// It follows the rules in POWERUPS_AND_KEYBOARD.md 7.2:
//   - never while typing in a text box (typing "Rob" must not roll)
//   - never with Ctrl / Alt / Cmd (so Ctrl+R still reloads), never for a held-down key
//   - upper and lower case both work
//   - only when `enabled`, so just one screen's keys are active at a time
// Handlers must do exactly what the matching button does. The safest way is
// pressShortcutButton below, which clicks the real button.
export function useGameShortcuts(shortcuts, handlers, { enabled = true } = {}) {
  // Always call the newest handlers without re-adding the listener on every render
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!enabled) return undefined;

    function onKeyDown(event) {
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
      if (isTyping(event.target)) return;

      const key = event.key.toLowerCase();
      const shortcut = shortcuts.find((s) => s.key === key);
      const handler = shortcut && handlersRef.current[shortcut.action];
      if (!handler) return;

      // Stop the browser doing its own thing with the key (e.g. "?" opening a find bar)
      event.preventDefault();
      handler(shortcut);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcuts, enabled]);
}

function isTyping(element) {
  if (!element) return false;
  const tag = element.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || element.isContentEditable;
}

// Clicks the visible button marked data-shortcut="<name>", exactly as a mouse would.
// The game screen draws two layouts (desktop and phone) and CSS hides one, so we
// pick the one on screen (offsetParent is null for hidden elements).
// A disabled button ignores .click(), so a key never works when the button wouldn't:
// busy, computer's turn, game over and so on.
export function pressShortcutButton(name) {
  const buttons = document.querySelectorAll(`[data-shortcut="${name}"]`);
  const button = [...buttons].find((b) => b.offsetParent !== null);
  button?.click();
}