import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
    // Sign-in tables, including "users"
    ...authTables,

    // One document per game room
    rooms: defineTable({
        code: v.string(), // short join code, for example "K7P4QX"
        hostId: v.id("users"),
        maxPoints: v.number(),
        status: v.union(
            v.literal("lobby"),
            v.literal("playing"),
            v.literal("finished")
        ),
        currentSeat: v.number(), // whose turn it is
        lastRoll: v.optional(v.number()),
        winnerId: v.optional(v.id("users")),
        finishedAt: v.optional(v.number()),
    }).index("by_code", ["code"]),

    // One document per player in a room
    roomPlayers: defineTable({
        roomId: v.id("rooms"),
        userId: v.id("users"),
        name: v.string(),
        seat: v.number(),
        totalPoints: v.number(),
        runningPoints: v.number(),
        powerUps: v.array(v.string()), // filled in by the power-ups lane
    })
        .index("by_room", ["roomId"])
        .index("by_user", ["userId"])
        .index("by_room_and_user", ["roomId", "userId"]),

    // A log of every roll, pass and power-up: this feeds match history
    turns: defineTable({
        roomId: v.id("rooms"),
        userId: v.id("users"),
        seat: v.number(),
        action: v.union(
            v.literal("roll"),
            v.literal("pass"),
            v.literal("powerUp")
        ),
        value: v.optional(v.number()),
        runningAfter: v.number(),
        totalAfter: v.number(),
    }).index("by_room", ["roomId"]),
});