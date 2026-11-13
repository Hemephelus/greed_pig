// Create a fresh game log with no turns recorded yet.
export function createGameLog({ clientGameId, mode = "classic", targetScore, players }) {
  return { clientGameId, mode, targetScore, players, turns: [], winnerSeat: null };
}

// Add one dice result to the open turn, or begin that player's turn.
export function addRollToGameLog(log, seat, dice, busted) {
  if (!log) return log;
  const turns = [...log.turns];
  const lastTurn = turns[turns.length - 1];
  if (lastTurn && lastTurn.seat === seat) {
    turns[turns.length - 1] = { ...lastTurn, rolls: [...lastTurn.rolls, dice] };
  } else {
    turns.push({ seat, rolls: [dice], outcome: null, pointsBanked: null });
  }
  const updatedLog = { ...log, turns };
  return busted ? closeGameLogTurn(updatedLog, seat, "bust", 0) : updatedLog;
}

// Close the current player's turn as a bust or banked turn.
export function closeGameLogTurn(log, seat, outcome, pointsBanked) {
  if (!log) return log;
  const turns = [...log.turns];
  const index = turns.length - 1;
  if (index < 0 || turns[index].seat !== seat) {
    turns.push({ seat, rolls: [], outcome, pointsBanked });
    return { ...log, turns };
  }
  turns[index] = { ...turns[index], outcome, pointsBanked };
  return { ...log, turns };
}

// Set the winner after closing their final, unpassed turn.
export function finishGameLog(log, winnerSeat, winnerRunningPoints) {
  return { ...closeGameLogTurn(log, winnerSeat, "banked", winnerRunningPoints), winnerSeat };
}
