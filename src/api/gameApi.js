const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  constructor({ code, message }, status = 0) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

// Errors that mean "our screen is out of sync with the server".
// When one of these happens, call getGame() and re-render.
export const RESYNC_CODES = ["NOT_YOUR_TURN", "GAME_OVER", "POWERUP_NOT_FOUND"];

async function request(method, path, body) {
  if (!API_URL) {
    throw new ApiError({
      code: "CONFIG_ERROR",
      message: "VITE_API_URL is not set. Check your .env.local file.",
    });
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError({
      code: "NETWORK_ERROR",
      message: "Cannot reach the game server. Check your connection and try again.",
    });
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new ApiError(
      { code: "BAD_RESPONSE", message: "The server sent an unreadable response." },
      res.status
    );
  }

  if (!res.ok || !data.success) {
    throw new ApiError(
      data?.error ?? { code: "UNKNOWN", message: "Something went wrong." },
      res.status
    );
  }
  return data;
}

export const createGame = ({ playerNames, winningTarget }) =>
  request("POST", "/game/create", {
    player_names: playerNames,
    winning_target: winningTarget,
  });

export const getGame = (gameId) =>
  request("GET", `/game/${encodeURIComponent(gameId)}`);

export const roll = ({ gameId, playerIndex }) =>
  request("POST", "/game/roll", { game_id: gameId, player_index: playerIndex });

export const bank = ({ gameId, playerIndex }) =>
  request("POST", "/game/bank", { game_id: gameId, player_index: playerIndex });

// targetIndex is only needed for FREEZE and STEAL.
// JSON.stringify leaves out undefined values, so it is safe to omit.
// Named applyPowerup (not usePowerup) so ESLint does not mistake it for a React hook.
export const applyPowerup = ({ gameId, playerIndex, powerupId, targetIndex }) =>
  request("POST", "/game/powerup/use", {
    game_id: gameId,
    player_index: playerIndex,
    powerup_id: powerupId,
    target_index: targetIndex,
  });