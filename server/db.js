import { randomUUID } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";

const { CONVEX_URL } = process.env;
const useConvex = Boolean(CONVEX_URL);

const client = useConvex ? new ConvexHttpClient(CONVEX_URL) : null;
// Only load the generated Convex api when it's needed, so the server can still
// start in memory mode before anyone has run `npx convex dev`.
const api = useConvex ? (await import("./convex/_generated/api.js")).api : null;
const memory = new Map(); // fallback so teammates can run the server before Convex is set up

if (!useConvex) {
  console.warn("WARNING: CONVEX_URL is not set. Using in-memory storage (lost on restart).");
}

// Each function below takes/returns the whole game "state" object from logic/game.js.

export async function createGameRecord(state) {
  if (!useConvex) {
    const id = randomUUID();
    memory.set(id, state);
    return id;
  }
  return await client.mutation(api.games.create, { state });
}

export async function loadGame(id) {
  if (!useConvex) return memory.get(id) ?? null;
  return await client.query(api.games.get, { id });
}

export async function saveGame(id, state) {
  if (!useConvex) {
    memory.set(id, state);
    return;
  }
  await client.mutation(api.games.save, { id, state });
}
