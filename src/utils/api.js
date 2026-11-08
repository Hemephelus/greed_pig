const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

// One place for every call to the backend, so errors are handled the same way everywhere.
async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("Can't reach the game server. Check your internet and try again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}

// Turns the local player list into what the server needs (just names).
export const toPlayerList = (playerData) =>
  playerData.map((p) => ({ name: p.name || p.tag || "" }));

export const createGame = (playerData, maxPoints) =>
  request("/games", {
    method: "POST",
    body: JSON.stringify({ players: toPlayerList(playerData), maxPoints: Number(maxPoints) }),
  });

export const getGame = (id) => request(`/games/${id}`);
export const rollDice = (id) => request(`/games/${id}/roll`, { method: "POST" });
export const passTurn = (id) => request(`/games/${id}/pass`, { method: "POST" });

// Free hosting puts the server to sleep when idle. Pinging it early wakes it up
// while the player is still on the setup screen.
export const wakeServer = () => {
  fetch(`${API}/health`).catch(() => {});
};
