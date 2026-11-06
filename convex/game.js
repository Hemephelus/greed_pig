import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const POWER_UPS = ["shield", "double", "freeze", "reverse"];
const MAX_HELD = 2;

function randomPowerUp() {
    return POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)];
}

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

// Move the turn to the next player in the current direction, skipping frozen players
async function advanceTurn(ctx, room, players, fromSeat, lastRoll) {
    const dir = room.direction ?? 1;
    const count = players.length;
    let seat = fromSeat;
    for (let i = 0; i < count; i++) {
        seat = (seat + dir + count) % count;
        const next = players.find((p) => p.seat === seat);
        if (next.frozen) {
            await ctx.db.patch(next._id, { frozen: false }); // the freeze is used up
        } else {
            break;
        }
    }
    await ctx.db.patch(room._id, { currentSeat: seat, lastRoll });
}

export const roll = mutation({
    args: { code: v.string() },
    handler: async (ctx, { code }) => {
        const { userId, room, players, me } = await loadTurn(ctx, code);

        // The dice are rolled HERE, on the server, never in the browser
        const value = Math.floor(Math.random() * 6) + 1;

        if (value === 1) {
            // Shield: keep your running points and carry on
            if (me.shieldArmed) {
                await ctx.db.patch(me._id, { shieldArmed: false, doubleArmed: false });
                await ctx.db.patch(room._id, { lastRoll: 1 });
                await ctx.db.insert("turns", {
                    roomId: room._id,
                    userId,
                    seat: me.seat,
                    action: "roll",
                    value: 1,
                    runningAfter: me.runningPoints,
                    totalAfter: me.totalPoints,
                    detail: "shield saved the turn",
                });
                return { value: 1, busted: false, won: false, shielded: true };
            }

            // No shield: lose the running points and pass the turn
            await ctx.db.patch(me._id, { runningPoints: 0, doubleArmed: false });
            await advanceTurn(ctx, room, players, me.seat, 1);
            await ctx.db.insert("turns", {
                roomId: room._id,
                userId,
                seat: me.seat,
                action: "roll",
                value: 1,
                runningAfter: 0,
                totalAfter: me.totalPoints,
            });
            return { value: 1, busted: true, won: false, shielded: false };
        }

        // Any other number is added to this turn's running points (doubled by Double Down)
        const gained = me.doubleArmed ? value * 2 : value;
        const running = me.runningPoints + gained;
        const won = me.totalPoints + running >= room.maxPoints;

        // Rolling a 6 earns a random power-up, if you hold fewer than the maximum
        let earned = null;
        if (value === 6 && !won && me.powerUps.length < MAX_HELD) {
            earned = randomPowerUp();
        }

        await ctx.db.patch(me._id, {
            runningPoints: won ? 0 : running,
            totalPoints: won ? me.totalPoints + running : me.totalPoints,
            doubleArmed: false,
            powerUps: earned ? [...me.powerUps, earned] : me.powerUps,
        });

        if (won) {
            await ctx.db.patch(room._id, {
                status: "finished",
                winnerId: userId,
                finishedAt: Date.now(),
                lastRoll: value,
            });
        } else {
            await ctx.db.patch(room._id, { lastRoll: value });
        }

        const detail =
            [gained !== value ? "doubled" : null, earned ? `earned ${earned}` : null]
                .filter(Boolean)
                .join(", ") || undefined;

        await ctx.db.insert("turns", {
            roomId: room._id,
            userId,
            seat: me.seat,
            action: "roll",
            value,
            runningAfter: won ? 0 : running,
            totalAfter: won ? me.totalPoints + running : me.totalPoints,
            detail,
        });
        return { value, gained, busted: false, won, earned, shielded: false };
    },
});

export const pass = mutation({
    args: { code: v.string() },
    handler: async (ctx, { code }) => {
        const { userId, room, players, me } = await loadTurn(ctx, code);
        if (me.runningPoints === 0) throw new Error("Roll at least once before passing");

        const total = me.totalPoints + me.runningPoints;
        await ctx.db.patch(me._id, { totalPoints: total, runningPoints: 0 });
        await advanceTurn(ctx, room, players, me.seat, room.lastRoll);
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

export const activatePowerUp = mutation({
    args: { code: v.string(), powerUp: v.string() },
    handler: async (ctx, { code, powerUp }) => {
        const { userId, room, players, me } = await loadTurn(ctx, code);

        const index = me.powerUps.indexOf(powerUp);
        if (index === -1) throw new Error("You do not have that power-up");

        const patch = { powerUps: me.powerUps.filter((_, i) => i !== index) };
        const dir = room.direction ?? 1;

        switch (powerUp) {
            case "shield":
                if (me.shieldArmed) throw new Error("Your shield is already active");
                patch.shieldArmed = true;
                break;
            case "double":
                if (me.doubleArmed) throw new Error("Double Down is already active");
                patch.doubleArmed = true;
                break;
            case "freeze": {
                const target = players.find(
                    (p) => p.seat === (me.seat + dir + players.length) % players.length
                );
                if (target.frozen) throw new Error("That player is already frozen");
                await ctx.db.patch(target._id, { frozen: true });
                break;
            }
            case "reverse": {
                await ctx.db.patch(room._id, { direction: -dir });
                // Like Uno: with only two players, Reverse acts as a skip
                if (players.length === 2) {
                    const opponent = players.find((p) => p.seat !== me.seat);
                    if (opponent.frozen) throw new Error("That player is already frozen");
                    await ctx.db.patch(opponent._id, { frozen: true });
                }
                break;
            }
            default:
                throw new Error("Unknown power-up");
        }

        await ctx.db.patch(me._id, patch);
        await ctx.db.insert("turns", {
            roomId: room._id,
            userId,
            seat: me.seat,
            action: "powerUp",
            runningAfter: me.runningPoints,
            totalAfter: me.totalPoints,
            detail: powerUp,
        });
        return { used: powerUp };
    },
});

// TESTING ONLY: gives you a power-up so you don't have to wait for a 6.
// It refuses to run unless ALLOW_DEV_TOOLS is "true", which is never set on production.
export const devGrant = mutation({
    args: { code: v.string(), powerUp: v.string() },
    handler: async (ctx, { code, powerUp }) => {
        if (process.env.ALLOW_DEV_TOOLS !== "true") throw new Error("Not available");
        if (!POWER_UPS.includes(powerUp)) throw new Error("Unknown power-up");
        const { me } = await loadTurn(ctx, code);
        if (me.powerUps.length >= MAX_HELD) throw new Error("Already holding the maximum");
        await ctx.db.patch(me._id, { powerUps: [...me.powerUps, powerUp] });
    },
});