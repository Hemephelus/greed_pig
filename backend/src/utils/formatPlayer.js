// Turns a players row (+ its power-ups) into the "player object" from the doc.
// powerups only lists AVAILABLE ones, as { id, type }.
export function formatPlayer(row, powerups = []) {
  return {
    id: row.id,
    game_id: row.game_id,
    player_index: row.player_index,
    name: row.name,
    total_score: row.total_score,
    turn_score: row.turn_score,
    shield_active: row.shield_active,
    double_active: row.double_active,
    skip_next_turn: row.skip_next_turn,
    powerups: powerups
      .filter((p) => p.player_id === row.id && p.status === "AVAILABLE")
      .map((p) => ({ id: p.id, type: p.type })),
  };
}
