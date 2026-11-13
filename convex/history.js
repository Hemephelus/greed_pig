import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// All finished games the signed-in user played in, newest first.
async function loadFinishedGames(ctx, userId) {
  const memberships = await ctx.db
    .query("roomPlayers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  const games = [];
  for (const me of memberships) {
    const room = await ctx.db.get(me.roomId);
    if (!room || room.status !== "finished") continue;
    const players = await ctx.db
      .query("roomPlayers")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();
    players.sort((a, b) => a.seat - b.seat);
    games.push({ room, me, players });
  }
  const when = (g) => g.room.finishedAt ?? g.room._creationTime;
  games.sort((a, b) => when(b) - when(a));
  return games;
}

export const myGames = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const games = await loadFinishedGames(ctx, userId);
    return games.map(({ room, me, players }) => ({
      roomId: room._id,
      code: room.code,
      maxPoints: room.maxPoints,
      finishedAt: room.finishedAt ?? room._creationTime,
      won: room.winnerId === userId,
      myScore: me.totalPoints + me.runningPoints,
      // Only the players of this shared game, and no user ids
      players: players.map((p) => ({
        name: p.name,
        score: p.totalPoints + p.runningPoints,
        isWinner: p.userId === room.winnerId,
        isMe: p.userId === userId,
      })),
    }));
  },
});

export const myStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const games = await loadFinishedGames(ctx, userId);
    const played = games.length;
    const wins = games.filter((g) => g.room.winnerId === userId).length;
    const highestScore = games.reduce(
      (best, g) => Math.max(best, g.me.totalPoints + g.me.runningPoints),
      0,
    );
    return {
      played,
      wins,
      losses: played - wins,
      winRate: played ? Math.round((wins / played) * 100) : 0,
      highestScore,
    };
  },
});
