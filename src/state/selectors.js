// Small read-only helpers so components don't repeat the same logic.

// Player whose turn it is
export function getActivePlayer(players, session) {
  if (!session) return null;
  return players.find((p) => p.player_index === session.active_player_index) ?? null;
}

// Highest banked score first. turn_score breaks ties (it is not banked yet).
export function getLeaderboard(players) {
  return [...players].sort(
    (a, b) => b.total_score - a.total_score || b.turn_score - a.turn_score
  );
}

// Points the active player still needs to win if they bank now
export function getPointsToWin(player, session) {
  if (!player || !session) return null;
  return Math.max(0, session.winning_target - player.total_score - player.turn_score);
}
