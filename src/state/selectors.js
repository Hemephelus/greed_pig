// Small read-only helpers so components don't repeat the same logic.

import { MAX_POWERUPS_HELD } from "src/constants/powerups";

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

// The active player's unused power-ups (max 3), or [] once one was used this turn.
export function getUsablePowerups(activePlayer, session) {
  if (!activePlayer || !session || session.powerup_used_this_turn) return [];
  return (activePlayer.powerups ?? []).slice(0, MAX_POWERUPS_HELD);
}

// Everyone except the active player (Muddy Trotters targets).
export function getTargets(players, activePlayer) {
  if (!activePlayer) return [];
  return players.filter((p) => p.player_index !== activePlayer.player_index);
}