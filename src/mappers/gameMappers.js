// Converts between backend data and what the UI needs.
// Keep backend field names (total_score, turn_score, player_index, ...) everywhere
// in the app; these helpers only ADD UI-only fields like the avatar picture.

import { GAME_STATUS } from "src/constants/game";

// ---------- setup screen -> API ----------

// The backend needs a name for every player. If a player left the box empty,
// use their pig pet name ("tag") so the old "fallback name" feature still works.
// Computer players with no name get "<pig name> (CPU)".
export function toPlayerNames(setupPlayers) {
  return setupPlayers.map((p) => {
    const name = (p.name || "").trim();
    if (name) return name;
    const tag = (p.tag || "").trim();
    return p.is_computer ? `${tag || "Computer"} (CPU)` : tag;
  });
}

// The backend has no avatar column. We remember which pig each seat picked,
// keyed by player_index, and store it on this device (see utils/gameStorage.js).
export function toAvatarMap(setupPlayers) {
  return Object.fromEntries(setupPlayers.map((p, i) => [i, p.pig_index ?? i]));
}

// The backend doesn't know which seats are computers either.
// { [player_index]: difficulty level }, only for computer seats.
export function toComputerMap(setupPlayers) {
  return Object.fromEntries(
    setupPlayers
      .map((p, i) => [i, p])
      .filter(([, p]) => p.is_computer)
      .map(([i, p]) => [i, p.difficulty])
  );
}

// ---------- API -> UI ----------

// Turns any API response into the session object the app keeps.
// - create returns { game_id, winning_target } (no status / active index yet)
// - get returns { session: {...} }
// - roll/bank return { active_player_index }
export function toSession(response, previous = null) {
  if (response.session) return { ...response.session };
  return {
    id: response.game_id ?? previous?.id,
    status: previous?.status ?? GAME_STATUS.IN_PROGRESS,
    winning_target: response.winning_target ?? previous?.winning_target,
    active_player_index:
      response.active_player_index ?? previous?.active_player_index ?? 0,
  };
}

// Adds UI-only fields to a backend player.
//   avatar     -> image URL for the pig picked on the setup screen
//   pig_index  -> which pig image
//   is_active  -> true if it is this player's turn
//   is_computer, difficulty -> computer seat and its level (1–5), or null
export function toUiPlayer(
  apiPlayer,
  { avatars = {}, computers = {}, pigImages = [], activeIndex = 0 } = {}
) {
  const pigIndex = avatars[apiPlayer.player_index] ?? apiPlayer.player_index;
  const difficulty = computers[apiPlayer.player_index] ?? null;
  return {
    ...apiPlayer,
    pig_index: pigIndex,
    avatar: pigImages.length ? pigImages[pigIndex % pigImages.length] : undefined,
    is_active: apiPlayer.player_index === activeIndex,
    is_computer: difficulty !== null,
    difficulty,
  };
}

// The guide shows `winner: null` but not what it looks like on a win.
// Accept a player object, a player_index, or a name, so either backend choice works.
export function getWinner(winner, players) {
  if (winner == null) return null;
  if (typeof winner === "object") {
    return players.find((p) => p.player_index === winner.player_index) ?? winner;
  }
  if (typeof winner === "number") return players.find((p) => p.player_index === winner) ?? null;
  if (typeof winner === "string") return players.find((p) => p.name === winner) ?? null;
  return null;
}
