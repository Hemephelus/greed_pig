import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// These three functions are the only way the Express server touches the database.

export const create = mutation({
  args: { state: v.any() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("games", { state: args.state });
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("games", args.id); // null if the id is malformed
    if (!id) return null;
    const game = await ctx.db.get(id);
    return game ? game.state : null;
  },
});

export const save = mutation({
  args: { id: v.string(), state: v.any() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("games", args.id);
    if (!id) throw new Error("Game not found");
    await ctx.db.patch(id, { state: args.state });
  },
});
