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
    mud_bath_active: row.mud_bath_active,
    halve_next_bank: row.halve_next_bank,
    powerups: powerups
      .filter((p) => p.player_id === row.id && p.status === "AVAILABLE")
      .map((p) => ({ id: p.id, type: p.type })),
  };
}
