import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { applyDoubleJeopardyRoll } from "./lib/doubleJeopardyRules";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;
const MIN_TARGET_SCORE = 10;
const MAX_TARGET_SCORE = 1000;

const modeValidator = v.union(
  v.literal("classic"),
  v.literal("double_jeopardy"),
);

const playerInputValidator = v.object({
  name: v.string(),
  avatar: v.string(),
});

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function requireActiveDoubleJeopardyGame(game) {
  if (!game) {
    throw new Error("Game not found");
  }
  if (game.status !== "active") {
    throw new Error("Game is not active");
  }
  if (game.mode !== "double_jeopardy") {
    throw new Error("Game is not in Double Jeopardy mode");
  }
  if (!game.players[game.currentPlayerIndex]) {
    throw new Error("Game has an invalid current player");
  }
}

function nextPlayerIndex(currentPlayerIndex, playerCount) {
  return (currentPlayerIndex + 1) % playerCount;
}

export const createGame = mutation({
  args: {
    mode: modeValidator,
    targetScore: v.number(),
    players: v.array(playerInputValidator),
  },
  handler: async (ctx, args) => {
    if (args.mode !== "classic" && args.mode !== "double_jeopardy") {
      throw new Error("Mode must be classic or double_jeopardy");
    }
    if (
      args.players.length < MIN_PLAYERS ||
      args.players.length > MAX_PLAYERS
    ) {
      throw new ConvexError(
        `A game needs ${MIN_PLAYERS} to ${MAX_PLAYERS} players`,
      );
    }
    if (
      !Number.isInteger(args.targetScore) ||
      args.targetScore < MIN_TARGET_SCORE ||
      args.targetScore > MAX_TARGET_SCORE
    ) {
      throw new Error(
        `Target score must be an integer from ${MIN_TARGET_SCORE} to ${MAX_TARGET_SCORE}`,
      );
    }

    const players = args.players.map(({ name, avatar }) => {
      const trimmedName = name.trim();
      if (!trimmedName) {
        throw new Error("Player names cannot be empty");
      }
      if (trimmedName.length > 30) {
        throw new Error("Player names cannot exceed 30 characters");
      }
      return {
        name: trimmedName,
        avatar,
        totalPoints: 0,
        runningPoints: 0,
      };
    });

    return await ctx.db.insert("games", {
      mode: args.mode,
      targetScore: args.targetScore,
      status: "active",
      currentPlayerIndex: 0,
      players,
    });
  },
});

export const getGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => await ctx.db.get(gameId),
});

export const rollDoubleJeopardy = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    requireActiveDoubleJeopardyGame(game);

    const die1 = rollDie();
    const die2 = rollDie();
    const playerIndex = game.currentPlayerIndex;
    const players = [...game.players];
    const player = { ...players[playerIndex] };
    const result = applyDoubleJeopardyRoll(die1, die2, player.runningPoints);

    let pointsBanked = 0;
    let turnEnds = false;

    if (result.outcome === "bust") {
      turnEnds = true;
    } else if (result.outcome === "saved") {
      // 1+3 keeps the points earned so far and ends the turn.
      pointsBanked = result.turnPoints;
      turnEnds = true;
    } else if (player.totalPoints + result.turnPoints >= game.targetScore) {
      // Same as Classic: reaching the target ends the game without a pass.
      pointsBanked = result.turnPoints;
      turnEnds = true;
    } else {
      player.runningPoints = result.turnPoints;
    }

    if (turnEnds) {
      player.totalPoints += pointsBanked;
      player.runningPoints = 0;
    }

    const hasWinner = player.totalPoints >= game.targetScore;
    const status = hasWinner ? "finished" : "active";
    const nextIndex =
      turnEnds && !hasWinner
        ? nextPlayerIndex(playerIndex, players.length)
        : playerIndex;

    players[playerIndex] = player;
    await ctx.db.patch(gameId, {
      players,
      currentPlayerIndex: nextIndex,
      status,
      lastRoll: { die1, die2, outcome: result.outcome },
      ...(hasWinner ? { winnerIndex: playerIndex } : {}),
    });

    return {
      playerIndex,
      die1,
      die2,
      outcome: result.outcome,
      pointsBanked,
      runningPoints: player.runningPoints,
      totalPoints: player.totalPoints,
      currentPlayerIndex: nextIndex,
      status,
      winnerIndex: hasWinner ? playerIndex : null,
    };
  },
});

export const passTurn = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    requireActiveDoubleJeopardyGame(game);

    const playerIndex = game.currentPlayerIndex;
    const players = [...game.players];
    const player = { ...players[playerIndex] };
    const pointsBanked = player.runningPoints;
    player.totalPoints += pointsBanked;
    player.runningPoints = 0;
    players[playerIndex] = player;

    const hasWinner = player.totalPoints >= game.targetScore;
    const status = hasWinner ? "finished" : "active";
    const nextIndex = hasWinner
      ? playerIndex
      : nextPlayerIndex(playerIndex, players.length);

    await ctx.db.patch(gameId, {
      players,
      currentPlayerIndex: nextIndex,
      status,
      ...(hasWinner ? { winnerIndex: playerIndex } : {}),
    });

    return {
      playerIndex,
      pointsBanked,
      totalPoints: player.totalPoints,
      currentPlayerIndex: nextIndex,
      status,
      winnerIndex: hasWinner ? playerIndex : null,
    };
  },
});
