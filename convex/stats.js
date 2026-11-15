import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { computeStats } from "./lib/computeStats";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;
const MAX_NAME_LENGTH = 30;
const MAX_TURNS = 1000;
const modeValidator = v.union(v.literal("classic"), v.literal("double_jeopardy"));
const outcomeValidator = v.union(v.literal("banked"), v.literal("bust"));
const gameLogArgs = {
  clientGameId: v.string(),
  mode: modeValidator,
  targetScore: v.number(),
  players: v.array(v.object({ seat: v.number(), name: v.string() })),
  turns: v.array(v.object({
    seat: v.number(),
    rolls: v.array(v.array(v.number())),
    outcome: outcomeValidator,
    pointsBanked: v.number(),
  })),
  winnerSeat: v.number(),
};

// Validate the browser log and write its game and player rows in one transaction.
async function saveGameLog(ctx, input) {
  const existing = await ctx.db
    .query("finishedGames")
    .withIndex("by_clientGameId", (q) => q.eq("clientGameId", input.clientGameId))
    .first();
  if (existing) return existing._id;

  if (!input.clientGameId.trim()) throw new Error("clientGameId cannot be empty");
  if (!Number.isInteger(input.targetScore) || input.targetScore < 10 || input.targetScore > 1000) {
    throw new Error("targetScore must be an integer from 10 to 1000");
  }
  if (input.players.length < MIN_PLAYERS || input.players.length > MAX_PLAYERS) {
    throw new Error(`A game needs ${MIN_PLAYERS} to ${MAX_PLAYERS} players`);
  }
  if (!Number.isInteger(input.winnerSeat) || input.winnerSeat < 0 || input.winnerSeat >= input.players.length) {
    throw new Error("winnerSeat must identify a player in this game");
  }
  if (input.turns.length === 0 || input.turns.length > MAX_TURNS) {
    throw new Error(`A game must have between 1 and ${MAX_TURNS} turns`);
  }

  const players = input.players.map((player, index) => {
    if (!Number.isInteger(player.seat) || player.seat < 0 || player.seat >= input.players.length) {
      throw new Error(`Player ${index + 1} has a seat outside the player range`);
    }
    const name = player.name.trim();
    if (!name || name.length > MAX_NAME_LENGTH) {
      throw new Error(`Player names must contain 1 to ${MAX_NAME_LENGTH} characters`);
    }
    return { ...player, name };
  });
  if (new Set(players.map((player) => player.seat)).size !== players.length) {
    throw new Error("Each player must have a unique seat");
  }

  const scores = players.map(() => 0);
  const expectedDiceCount = input.mode === "classic" ? 1 : 2;
  for (const [turnIndex, turn] of input.turns.entries()) {
    if (!Number.isInteger(turn.seat) || turn.seat < 0 || turn.seat >= players.length) {
      throw new Error(`Turn ${turnIndex + 1} has a seat outside the player range`);
    }
    if (!turn.rolls.length) throw new Error(`Turn ${turnIndex + 1} must contain a roll`);
    if (!Number.isInteger(turn.pointsBanked) || turn.pointsBanked < 0) {
      throw new Error(`Turn ${turnIndex + 1} has invalid pointsBanked`);
    }
    for (const roll of turn.rolls) {
      if (roll.length !== expectedDiceCount) {
        throw new Error(`Each ${input.mode} roll must contain ${expectedDiceCount} ${expectedDiceCount === 1 ? "die" : "dice"}`);
      }
      if (roll.some((die) => !Number.isInteger(die) || die < 1 || die > 6)) {
        throw new Error(`Turn ${turnIndex + 1} has a die outside 1 to 6`);
      }
    }

    const lastRoll = turn.rolls[turn.rolls.length - 1];
    let expectedPoints = 0;
    let expectedOutcome = "banked";
    if (input.mode === "classic") {
      if (turn.rolls.slice(0, -1).some((roll) => roll[0] === 1)) {
        throw new Error(`Turn ${turnIndex + 1} rolled a 1 before its last roll`);
      }
      expectedOutcome = lastRoll[0] === 1 ? "bust" : "banked";
      if (expectedOutcome === "banked") {
        expectedPoints = turn.rolls.reduce((sum, roll) => sum + roll[0], 0);
      }
    } else {
      const firstOne = turn.rolls.findIndex((roll) => roll.includes(1));
      if (firstOne !== -1 && firstOne !== turn.rolls.length - 1) {
        throw new Error(`Turn ${turnIndex + 1} rolled a 1 before its last roll`);
      }
      const savingRoll = lastRoll.includes(1) && lastRoll.includes(3);
      expectedOutcome = lastRoll.includes(1) && !savingRoll ? "bust" : "banked";
      const rollsToCount = savingRoll ? turn.rolls.slice(0, -1) : turn.rolls;
      if (expectedOutcome === "banked") {
        expectedPoints = rollsToCount.reduce(
          (sum, roll) => sum + roll[0] + roll[1], 0,
        );
      }
    }
    if (turn.outcome !== expectedOutcome) {
      throw new Error(`Turn ${turnIndex + 1} outcome does not match its rolls`);
    }
    if (turn.pointsBanked !== expectedPoints) {
      throw new Error(`Turn ${turnIndex + 1} pointsBanked should be ${expectedPoints}`);
    }
    scores[turn.seat] += turn.pointsBanked;
  }

  if (scores[input.winnerSeat] < input.targetScore) {
    throw new Error("The winner's score does not reach targetScore");
  }

  const log = { ...input, players };
  const stats = computeStats(log);
  const gameId = await ctx.db.insert("finishedGames", {
    clientGameId: log.clientGameId,
    mode: log.mode,
    targetScore: log.targetScore,
    playerCount: players.length,
    winnerSeat: log.winnerSeat,
    luckiestSeat: stats.luckiestSeat,
    bestRiskTakerSeat: stats.bestRiskTakerSeat,
    finishedAt: Date.now(),
    turns: log.turns,
  });
  for (const player of stats.playerStats) {
    await ctx.db.insert("playerStats", { gameId, ...player });
  }
  return gameId;
}

export const saveGame = mutation({
  args: gameLogArgs,
  handler: async (ctx, log) => await saveGameLog(ctx, log),
});

export const getGameStats = query({
  args: { gameId: v.string() },
  handler: async (ctx, { gameId }) => {
    const normalizedId = ctx.db.normalizeId("finishedGames", gameId);
    if (!normalizedId) return null;
    const game = await ctx.db.get(normalizedId);
    if (!game) return null;
    const players = await ctx.db
      .query("playerStats")
      .withIndex("by_game", (q) => q.eq("gameId", normalizedId))
      .collect();
    players.sort((a, b) => b.finalScore - a.finalScore);
    return { game, players };
  },
});

export const listRecentGames = query({
  args: {},
  handler: async (ctx) => {
    const games = await ctx.db.query("finishedGames").collect();
    games.sort((a, b) => b.finishedAt - a.finishedAt);
    const recentGames = games.slice(0, 10);
    return await Promise.all(recentGames.map(async (game) => {
      const players = await ctx.db
        .query("playerStats")
        .withIndex("by_game", (q) => q.eq("gameId", game._id))
        .collect();
      const winner = players.find((player) => player.seat === game.winnerSeat);
      return {
        gameId: game._id,
        mode: game.mode,
        targetScore: game.targetScore,
        playerCount: game.playerCount,
        winnerName: winner?.name ?? null,
        finishedAt: game.finishedAt,
      };
    }));
  },
});

//fake game stats
export const seedFakeGame = internalMutation({
  args: {},
  handler: async (ctx) => await saveGameLog(ctx, {
    clientGameId: "fake-stats-game-4-player",
    mode: "classic",
    targetScore: 50,
    players: [
      { seat: 0, name: "Ada" },
      { seat: 1, name: "Bola" },
      { seat: 2, name: "Chen" },
      { seat: 3, name: "Dara" },
    ],
    turns: [
      { seat: 0, rolls: [[4], [5]], outcome: "banked", pointsBanked: 9 },
      { seat: 1, rolls: [[2], [1]], outcome: "bust", pointsBanked: 0 },
      { seat: 2, rolls: [[6], [2], [3]], outcome: "banked", pointsBanked: 11 },
      { seat: 3, rolls: [[5], [6]], outcome: "banked", pointsBanked: 11 },
      { seat: 0, rolls: [[6], [4]], outcome: "banked", pointsBanked: 10 },
      { seat: 1, rolls: [[3], [4]], outcome: "banked", pointsBanked: 7 },
      { seat: 2, rolls: [[2], [1]], outcome: "bust", pointsBanked: 0 },
      { seat: 3, rolls: [[6], [5], [4]], outcome: "banked", pointsBanked: 15 },
      { seat: 0, rolls: [[1]], outcome: "bust", pointsBanked: 0 },
      { seat: 3, rolls: [[6], [6], [6], [6]], outcome: "banked", pointsBanked: 24 },
    ],
    winnerSeat: 3,
  }),
});
