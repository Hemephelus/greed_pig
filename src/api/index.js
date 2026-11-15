// The ONLY place components should import API functions from:
//   import { createGame, roll, bank } from "src/api";
// It picks the real backend or the in-browser mock based on VITE_USE_MOCK_API.

import * as realApi from "./gameApi";
import * as mockApi from "./mockGameApi";

// .env.local: VITE_USE_MOCK_API=true -> fake server in the browser (no backend needed)
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

const api = USE_MOCK_API ? mockApi : realApi;

if (USE_MOCK_API && import.meta.env.DEV) {
  console.info("[Greedy Pig] Using the MOCK game API (VITE_USE_MOCK_API=true).");
}

export const createGame = api.createGame;
export const getGame = api.getGame;
export const roll = api.roll;
export const bank = api.bank;
export const applyPowerup = api.applyPowerup;

export { ApiError, RESYNC_CODES } from "./gameApi";
