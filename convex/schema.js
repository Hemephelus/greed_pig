import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const gameMode = v.union(
  v.literal("classic"),
  v.literal("double_jeopardy")
);

const rollOutcome = v.union(
  v.literal("bust"),
  v.literal("saved"),
  v.literal("continue")
);

const turnOutcome = v.union(v.literal("banked"), v.literal("bust"));

export default defineSchema({
  // Keep the messages shape shown by the existing Convex README example.
  messages: defineTable({
    body: v.string(),
    author: v.string(),
  }),

  games: defineTable({
    mode: gameMode,
    targetScore: v.number(),
    status: v.union(v.literal("active"), v.literal("finished")),
    currentPlayerIndex: v.number(),
    players: v.array(
      v.object({
        name: v.string(),
        avatar: v.string(),
        totalPoints: v.number(),
        runningPoints: v.number(),
      })
    ),
    lastRoll: v.optional(
      v.object({
        die1: v.number(),
        die2: v.number(),
        outcome: rollOutcome,
      })
    ),
    winnerIndex: v.optional(v.number()),
  }),

  // One completed game saved for the statistics screen, with its recorded turns.
  finishedGames: defineTable({
    clientGameId: v.string(),
    mode: gameMode,
    targetScore: v.number(),
    playerCount: v.number(),
    winnerSeat: v.number(),
    luckiestSeat: v.optional(v.number()),
    bestRiskTakerSeat: v.optional(v.number()),
    finishedAt: v.number(),
    turns: v.array(
      v.object({
        seat: v.number(),
        rolls: v.array(v.array(v.number())),
        outcome: turnOutcome,
        pointsBanked: v.number(),
      }),
    ),
  }).index("by_clientGameId", ["clientGameId"]),

  // One row of calculated statistics for a player in a completed game.
  playerStats: defineTable({
    gameId: v.id("finishedGames"),
    seat: v.number(),
    name: v.string(),
    finalScore: v.number(),
    totalRolls: v.number(),
    turnsTaken: v.number(),
    successfulTurns: v.number(),
    busts: v.number(),
    avgRollsPerTurn: v.number(),
    longestStreak: v.number(),
    bustRate: v.number(),
  }).index("by_game", ["gameId"]),
});
