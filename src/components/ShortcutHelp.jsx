/* eslint-disable react/prop-types */
import { SHORTCUTS } from "src/constants/shortcuts";
import { useGameShortcuts } from "src/hooks/useGameShortcuts";
import ShortcutList from "./ShortcutList";

// The "⌨ Shortcuts" corner button and the help overlay it opens.
// Game.jsx owns `open`, because the game's own keys must pause while this is open.
export default function ShortcutHelp({ open, onOpen, onClose }) {
  // While open, only Esc and ? work (they close it)
  useGameShortcuts(SHORTCUTS.help, { close: onClose }, { enabled: open });

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="sec-font fixed bottom-4 right-4 z-30 hidden md:block rounded-lg border border-[#ffffff60] bg-[#00000080] px-3 py-2 text-sm text-white duration-300 hover:bg-[#000000c0]"
      >
        ⌨ Shortcuts <kbd className="ml-1 font-mono text-[10px] px-1.5 py-0.5 rounded border border-[#ffffff60] border-b-2">?</kbd>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#000000c0] p-4"
          onClick={onClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcut-help-title"
            className="sec-font max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-[#ffffff60] bg-[#1b1022] p-5 text-white"
            // Clicks inside the panel must not reach the backdrop and close it
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="shortcut-help-title" className="pri-font mb-4 text-2xl">
              Keyboard shortcuts
            </h2>
            <ShortcutList className="text-sm" />
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-lg bg-[#D30CBD] py-2 font-bold duration-300 hover:bg-[#d30cbcc0]"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}