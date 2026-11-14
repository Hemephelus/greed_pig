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
});
