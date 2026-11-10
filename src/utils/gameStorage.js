// Remembers the current game on this device so "Resume Game" and page refresh work.
// Stores only { gameId, avatars, computers }. Scores always come from the server.

const KEY = "greedy-pig:current-game";

export function saveCurrentGame({ gameId, avatars, computers = {} }) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ gameId, avatars, computers }));
  } catch {
    /* private mode / storage blocked: the game still works, it just won't resume */
  }
}

export function loadCurrentGame() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

export function clearCurrentGame() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
