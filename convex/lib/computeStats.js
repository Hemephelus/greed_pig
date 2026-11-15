// Players need at least this many rolls to qualify for the Luckiest award.
const LUCKIEST_MIN_ROLLS = 5;

// Find the most frequently busted player who has enough rolls to qualify.
function getCursedAward(playerStats) {
  const candidates = playerStats.filter(
    (player) => player.totalRolls >= 5 && player.busts >= 1,
  );
  const winner = [...candidates].sort(
    (a, b) => b.bustRate - a.bustRate || a.finalScore - b.finalScore,
  )[0];
  return winner ? { key: "cursed", seat: winner.seat, value: winner.bustRate } : null;
}

// Find the single banked turn with the most points; stable sorting keeps the earlier tie.
function getJackpotAward(turns) {
  const winner = turns.map((turn, index) => ({ ...turn, index }))
    .filter((turn) => turn.pointsBanked > 0)
    .sort((a, b) => b.pointsBanked - a.pointsBanked || a.index - b.index)[0];
  return winner
    ? { key: "jackpot", seat: winner.seat, value: winner.pointsBanked }
    : null;
}

// Find the bust that discarded the largest sum from all rolls before its final roll.
function getHeartbreakerAward(turns) {
  const winner = turns.map((turn, index) => ({
    turn,
    index,
    pointsLost: turn.rolls.slice(0, -1)
      .reduce((sum, roll) => sum + roll.reduce((rollSum, die) => rollSum + die, 0), 0),
  })).filter(({ turn, pointsLost }) => turn.outcome === "bust" && pointsLost > 0)
    .sort((a, b) => b.pointsLost - a.pointsLost || a.index - b.index)[0];
  return winner
    ? { key: "heartbreaker", seat: winner.turn.seat, value: winner.pointsLost }
    : null;
}

// Count banked Double Jeopardy turns that ended with the saving 1+3 roll.
function getCloseCallAward(log, playerStats) {
  if (log.mode !== "double_jeopardy") return null;
  const savedTurns = new Map(playerStats.map((player) => [player.seat, 0]));
  for (const turn of log.turns) {
    const lastRoll = turn.rolls[turn.rolls.length - 1] ?? [];
    if (turn.outcome === "banked" && lastRoll.includes(1) && lastRoll.includes(3)) {
      savedTurns.set(turn.seat, (savedTurns.get(turn.seat) ?? 0) + 1);
    }
  }
  const winner = playerStats.map((player) => ({
    ...player,
    savedTurns: savedTurns.get(player.seat) ?? 0,
  })).filter((player) => player.savedTurns >= 1)
    .sort((a, b) => b.savedTurns - a.savedTurns || b.finalScore - a.finalScore)[0];
  return winner
    ? { key: "closeCall", seat: winner.seat, value: winner.savedTurns }
    : null;
}

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
    extraAwards: [
      getCursedAward(playerStats),
      getJackpotAward(log.turns),
      getHeartbreakerAward(log.turns),
      getCloseCallAward(log, playerStats),
    ].filter(Boolean),
  };
}
