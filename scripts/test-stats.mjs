import { computeStats } from "../convex/lib/computeStats.js";
import process from "node:process";

const checks = [
  {
    name: "normal 3-player game",
    log: {
      players: [
        { seat: 0, name: "Ada" },
        { seat: 1, name: "Bola" },
        { seat: 2, name: "Chen" },
      ],
      turns: [
        { seat: 0, rolls: [[4], [6]], outcome: "banked", pointsBanked: 10 },
        { seat: 1, rolls: [[3], [1]], outcome: "bust", pointsBanked: 0 },
        { seat: 2, rolls: [[5]], outcome: "banked", pointsBanked: 5 },
      ],
    },
    expected: {
      players: [
        { seat: 0, finalScore: 10, totalRolls: 2, turnsTaken: 1, successfulTurns: 1, busts: 0, avgRollsPerTurn: 2, longestStreak: 2, bustRate: 0 },
        { seat: 1, finalScore: 0, totalRolls: 2, turnsTaken: 1, successfulTurns: 0, busts: 1, avgRollsPerTurn: 2, longestStreak: 2, bustRate: 0.5 },
        { seat: 2, finalScore: 5, totalRolls: 1, turnsTaken: 1, successfulTurns: 1, busts: 0, avgRollsPerTurn: 1, longestStreak: 1, bustRate: 0 },
      ],
      luckiestSeat: 0,
      bestRiskTakerSeat: 0,
    },
  },
  {
    name: "player who never rolled",
    log: {
      players: [
        { seat: 0, name: "No Rolls" },
        { seat: 1, name: "Rolled" },
      ],
      turns: [
        { seat: 1, rolls: [[4]], outcome: "banked", pointsBanked: 4 },
      ],
    },
    expected: {
      players: [
        { seat: 0, finalScore: 0, totalRolls: 0, turnsTaken: 0, successfulTurns: 0, busts: 0, avgRollsPerTurn: 0, longestStreak: 0, bustRate: 0 },
        { seat: 1, finalScore: 4, totalRolls: 1, turnsTaken: 1, successfulTurns: 1, busts: 0, avgRollsPerTurn: 1, longestStreak: 1, bustRate: 0 },
      ],
      luckiestSeat: 1,
      bestRiskTakerSeat: 1,
    },
  },
  {
    name: "tie uses first seat when all tie-breakers tie",
    log: {
      players: [
        { seat: 0, name: "First" },
        { seat: 1, name: "Second" },
      ],
      turns: [
        { seat: 0, rolls: [[5]], outcome: "banked", pointsBanked: 10 },
        { seat: 1, rolls: [[5]], outcome: "banked", pointsBanked: 10 },
      ],
    },
    expected: {
      players: [
        { seat: 0, finalScore: 10, totalRolls: 1, turnsTaken: 1, successfulTurns: 1, busts: 0, avgRollsPerTurn: 1, longestStreak: 1, bustRate: 0 },
        { seat: 1, finalScore: 10, totalRolls: 1, turnsTaken: 1, successfulTurns: 1, busts: 0, avgRollsPerTurn: 1, longestStreak: 1, bustRate: 0 },
      ],
      luckiestSeat: 0,
      bestRiskTakerSeat: 0,
    },
  },
  {
    name: "extra awards, tie-breaks, mode limit, and no qualifiers",
    log: {
      mode: "double_jeopardy",
      players: [
        { seat: 0, name: "Earlier" },
        { seat: 1, name: "Later" },
      ],
      turns: [
        { seat: 0, rolls: [[4, 4], [5, 5], [1, 3]], outcome: "banked", pointsBanked: 18 },
        { seat: 1, rolls: [[4, 4], [5, 5], [1, 3]], outcome: "banked", pointsBanked: 18 },
        { seat: 0, rolls: [[6, 6], [1, 2]], outcome: "bust", pointsBanked: 0 },
        { seat: 1, rolls: [[6, 6], [1, 2]], outcome: "bust", pointsBanked: 0 },
        { seat: 0, rolls: [[6, 6], [1, 2]], outcome: "bust", pointsBanked: 0 },
        { seat: 1, rolls: [[6, 6], [1, 2]], outcome: "bust", pointsBanked: 0 },
        { seat: 0, rolls: [[6, 6], [1, 2]], outcome: "bust", pointsBanked: 0 },
        { seat: 1, rolls: [[6, 6], [1, 2]], outcome: "bust", pointsBanked: 0 },
      ],
    },
    expected: {
      extraAwards: [
        { key: "cursed", seat: 0, value: 1 / 3 },
        { key: "jackpot", seat: 0, value: 18 },
        { key: "heartbreaker", seat: 0, value: 12 },
        { key: "closeCall", seat: 0, value: 1 },
      ],
    },
  },
  {
    name: "no extra award qualifies",
    log: {
      mode: "classic",
      players: [{ seat: 0, name: "Safe" }],
      turns: [{ seat: 0, rolls: [[2]], outcome: "banked", pointsBanked: 0 }],
    },
    expected: { extraAwards: [] },
  },
];

let failed = false;
for (const check of checks) {
  const actual = computeStats(check.log);
  const playerValues = actual.playerStats.map(
    ({ seat, finalScore, totalRolls, turnsTaken, successfulTurns, busts, avgRollsPerTurn, longestStreak, bustRate }) =>
      ({ seat, finalScore, totalRolls, turnsTaken, successfulTurns, busts, avgRollsPerTurn, longestStreak, bustRate }),
  );
  const passed = check.expected.players
    ? JSON.stringify(playerValues) === JSON.stringify(check.expected.players) &&
      actual.luckiestSeat === check.expected.luckiestSeat &&
      actual.bestRiskTakerSeat === check.expected.bestRiskTakerSeat
    : true;
  const allChecksPassed = passed &&
    (!check.expected.extraAwards || JSON.stringify(actual.extraAwards) === JSON.stringify(check.expected.extraAwards));
  console.log(`${allChecksPassed ? "PASS" : "FAIL"}: ${check.name}`);
  if (!allChecksPassed) {
    failed = true;
    console.log("Expected:", check.expected);
    console.log("Actual:", {
      players: playerValues,
      luckiestSeat: actual.luckiestSeat,
      bestRiskTakerSeat: actual.bestRiskTakerSeat,
    });
  }
}

if (failed) process.exitCode = 1;
