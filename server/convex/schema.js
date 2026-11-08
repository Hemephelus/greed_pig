import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// One table. Each document holds the whole game state built in logic/game.js.
export default defineSchema({
  games: defineTable({
    state: v.any(),
  }),
});
