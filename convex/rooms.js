import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// No O, 0, I or 1, so codes are easy to read out loud
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_PLAYERS = 6;

function makeCode() {
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    return code;
}

async function findRoom(ctx, code) {
    return await ctx.db
        .query("rooms")
        .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
        .unique();
}

async function getPlayers(ctx, roomId) {
    const players = await ctx.db
        .query("roomPlayers")
        .withIndex("by_room", (q) => q.eq("roomId", roomId))
        .collect();
    return players.sort((a, b) => a.seat - b.seat);
}

export const createRoom = mutation({
    args: { maxPoints: v.number() },
    handler: async (ctx, { maxPoints }) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Sign in first");
        if (!Number.isInteger(maxPoints) || maxPoints < 25 || maxPoints > 500) {
            throw new Error("Max points must be a whole number from 25 to 500");
        }
        const user = await ctx.db.get(userId);

        let code = null;
        for (let i = 0; i < 10 && code === null; i++) {
            const candidate = makeCode();
            if (!(await findRoom(ctx, candidate))) code = candidate;
        }
        if (code === null) throw new Error("Could not make a room code, try again");

        const roomId = await ctx.db.insert("rooms", {
            code,
            hostId: userId,
            maxPoints,
            status: "lobby",
            currentSeat: 0,
        });
        await ctx.db.insert("roomPlayers", {
            roomId,
            userId,
            name: user?.name ?? "Player",
            seat: 0,
            totalPoints: 0,
            runningPoints: 0,
            powerUps: [],
        });
        return code;
    },
});

export const joinRoom = mutation({
    args: { code: v.string() },
    handler: async (ctx, { code }) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Sign in first");
        const room = await findRoom(ctx, code);
        if (!room) throw new Error("Room not found");

        const players = await getPlayers(ctx, room._id);
        if (players.some((p) => p.userId === userId)) return room.code; // already in
        if (room.status !== "lobby") throw new Error("This game has already started");
        if (players.length >= MAX_PLAYERS) throw new Error("This room is full");

        const user = await ctx.db.get(userId);
        await ctx.db.insert("roomPlayers", {
            roomId: room._id,
            userId,
            name: user?.name ?? "Player",
            seat: players.length,
            totalPoints: 0,
            runningPoints: 0,
            powerUps: [],
        });
        return room.code;
    },
});

export const startGame = mutation({
    args: { code: v.string() },
    handler: async (ctx, { code }) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Sign in first");
        const room = await findRoom(ctx, code);
        if (!room) throw new Error("Room not found");
        if (room.hostId !== userId) throw new Error("Only the host can start the game");
        if (room.status !== "lobby") throw new Error("The game has already started");
        const players = await getPlayers(ctx, room._id);
        if (players.length < 2) throw new Error("You need at least 2 players");
        await ctx.db.patch(room._id, { status: "playing", currentSeat: 0 });
    },
});

// Live view of a room: every screen showing this updates automatically
export const getRoom = query({
    args: { code: v.string() },
    handler: async (ctx, { code }) => {
        const room = await findRoom(ctx, code);
        if (!room) return null;
        const players = await getPlayers(ctx, room._id);
        return { ...room, players };
    },
});
