// Players need at least this many rolls to qualify for the Luckiest award.
const LUCKIEST_MIN_ROLLS = 5;

/** Calculate each player's results and the two award seats from a game log. */
export function computeStats(log) {
  const statsBySeat = new Map(
    log.players.map((player) => [
      player.seat,
      {
        seat: player.seat,
        name: player.name,
        finalScore: 0,
        totalRolls: 0,
        turnsTaken: 0,
        successfulTurns: 0,
        busts: 0,
        avgRollsPerTurn: 0,
        longestStreak: 0,
        bustRate: 0,
      },
    ]),
  );

  for (const turn of log.turns) {
    const player = statsBySeat.get(turn.seat);
    if (!player) continue;

    const rollCount = turn.rolls.length;
    player.turnsTaken += 1;
    player.totalRolls += rollCount;
    player.longestStreak = Math.max(player.longestStreak, rollCount);
    player.finalScore += turn.pointsBanked;
    if (turn.outcome === "banked") player.successfulTurns += 1;
    if (turn.outcome === "bust") player.busts += 1;
  }

  const playerStats = [...statsBySeat.values()];
  for (const player of playerStats) {
    // A player with no turns or rolls gets a zero rate instead of NaN.
    player.avgRollsPerTurn = player.turnsTaken
      ? player.totalRolls / player.turnsTaken
      : 0;
    player.bustRate = player.totalRolls
      ? player.busts / player.totalRolls
      : 0;
  }

  const experiencedPlayers = playerStats.filter(
    (player) => player.totalRolls >= LUCKIEST_MIN_ROLLS,
  );
  const luckiestCandidates = experiencedPlayers.length
    ? experiencedPlayers
    : playerStats;
  const luckiest = [...luckiestCandidates].sort(
    (a, b) => a.bustRate - b.bustRate || b.finalScore - a.finalScore,
  )[0];
  const bestRiskTaker = [...playerStats].sort(
    (a, b) =>
      b.avgRollsPerTurn - a.avgRollsPerTurn ||
      b.longestStreak - a.longestStreak,
  )[0];

  return {
    playerStats,
    luckiestSeat: luckiest?.seat ?? null,
    bestRiskTakerSeat: bestRiskTaker?.seat ?? null,
  };
}
