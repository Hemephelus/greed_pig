import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Returns the signed-in user, or null if nobody is signed in
export const me = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) return null;
        return await ctx.db.get(userId);
    },
});