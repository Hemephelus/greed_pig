import { paginationOptsValidator } from "convex/server";
import { query } from "./_generated/server";

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) =>
    ctx.db.query("messages").order("desc").paginate(paginationOpts),
});
