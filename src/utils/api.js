// VITE_API_URL is set in .env.local (local dev) and in Vercel's Environment Variables (live).

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    // Network failure: server asleep, offline, or blocked by CORS.
    throw new Error("Can't reach the game server. Check your connection and try again.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // The server always sends { error: "..." } for failures.
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}

// Small helper for POST requests with a JSON body
const post = (path, body) =>
  request(path, { method: "POST", body: JSON.stringify(body) });

export const api = {
  health: () => request("/health"),
  createGame: (playerName) =>
    request("/api/games", { method: "POST", body: JSON.stringify({ playerName }) }),
  getGame: (id) => request(`/api/games/${id}`),

  // Live game: one server game for everyone at the table
  createLiveGame: (playerNames, maxPoints) =>
    post("/api/games", { playerNames, maxPoints }),

  // Lucky Shield / game actions: the server rolls the dice and applies the shield rules
  roll: (gameId, playerId) => post(`/api/games/${gameId}/roll`, { playerId }),
  pass: (gameId, playerId) => post(`/api/games/${gameId}/pass`, { playerId }),
  shieldDecision: (gameId, playerId, useShield) =>
    post(`/api/games/${gameId}/shield/decision`, { playerId, useShield }),
};