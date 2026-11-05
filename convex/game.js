import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Shared checks: signed in, game running, you are in the room, and it is your turn
async function loadTurn(ctx, code) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in first");

    const room = await ctx.db
        .query("rooms")
        .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
        .unique();
    if (!room) throw new Error("Room not found");
    if (room.status !== "playing") throw new Error("The game is not in progress");

    const players = await ctx.db
        .query("roomPlayers")
        .withIndex("by_room", (q) => q.eq("roomId", room._id))
        .collect();
    players.sort((a, b) => a.seat - b.seat);

    const me = players.find((p) => p.userId === userId);
    if (!me) throw new Error("You are not in this room");
    if (me.seat !== room.currentSeat) throw new Error("It is not your turn");

    return { userId, room, players, me };
}

export const roll = mutation({
    args: { code: v.string() },
    handler: async (ctx, { code }) => {
        const { userId, room, players, me } = await loadTurn(ctx, code);

        // The dice are rolled HERE, on the server, never in the browser
        const value = Math.floor(Math.random() * 6) + 1;

        // Rolling a 1 loses the turn's points and passes the turn
        if (value === 1) {
            await ctx.db.patch(me._id, { runningPoints: 0 });
            await ctx.db.patch(room._id, {
                currentSeat: (room.currentSeat + 1) % players.length,
                lastRoll: 1,
            });
            await ctx.db.insert("turns", {
                roomId: room._id,
                userId,
                seat: me.seat,
                action: "roll",
                value: 1,
                runningAfter: 0,
                totalAfter: me.totalPoints,
            });
            return { value: 1, busted: true, won: false };
        }

        // Any other number is added to this turn's running points
        const running = me.runningPoints + value;
        const won = me.totalPoints + running >= room.maxPoints;

        if (won) {
            await ctx.db.patch(me._id, {
                totalPoints: me.totalPoints + running,
                runningPoints: 0,
            });
            await ctx.db.patch(room._id, {
                status: "finished",
                winnerId: userId,
                finishedAt: Date.now(),
                lastRoll: value,
            });
        } else {
            await ctx.db.patch(me._id, { runningPoints: running });
            await ctx.db.patch(room._id, { lastRoll: value });
        }

        await ctx.db.insert("turns", {
            roomId: room._id,
            userId,
            seat: me.seat,
            action: "roll",
            value,
            runningAfter: won ? 0 : running,
            totalAfter: won ? me.totalPoints + running : me.totalPoints,
        });
        return { value, busted: false, won };
    },
});

export const pass = mutation({
    args: { code: v.string() },
    handler: async (ctx, { code }) => {
        const { userId, room, players, me } = await loadTurn(ctx, code);
        if (me.runningPoints === 0) throw new Error("Roll at least once before passing");

        const total = me.totalPoints + me.runningPoints;
        await ctx.db.patch(me._id, { totalPoints: total, runningPoints: 0 });
        await ctx.db.patch(room._id, {
            currentSeat: (room.currentSeat + 1) % players.length,
        });
        await ctx.db.insert("turns", {
            roomId: room._id,
            userId,
            seat: me.seat,
            action: "pass",
            runningAfter: 0,
            totalAfter: total,
        });
        return { total };
    },
});