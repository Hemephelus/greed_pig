// Remembers the current game on this device so "Resume Game" and page refresh work.
// Stores only { gameId, avatars, computers }. Scores always come from the server.
//
// The Truffle Sniff answer (is the next roll a 1?) is kept under its own key. The
// server never sends it back, so without this a refresh would lose it. It is
// stored with the game ID and the turn it belongs to, and the reducer ignores it
// if either no longer matches the server's session.

const KEY = "greedy-pig:current-game";
const SNIFF_KEY = "greedy-pig:sniff";

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
  clearSniff();
}

// { gameId, activePlayerIndex, nextRollIsOne }
export function saveSniff({ gameId, activePlayerIndex, nextRollIsOne }) {
  try {
    localStorage.setItem(SNIFF_KEY, JSON.stringify({ gameId, activePlayerIndex, nextRollIsOne }));
  } catch {
    /* ignore: the sniff answer just won't survive a refresh */
  }
}

export function loadSniff() {
  try {
    return JSON.parse(localStorage.getItem(SNIFF_KEY)) || null;
  } catch {
    return null;
  }
}

export function clearSniff() {
  try {
    localStorage.removeItem(SNIFF_KEY);
  } catch {
    /* ignore */
  }
}