import { computeStats } from "../convex/lib/computeStats.js";

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
];

let failed = false;
for (const check of checks) {
  const actual = computeStats(check.log);
  const playerValues = actual.playerStats.map(
    ({ seat, finalScore, totalRolls, turnsTaken, successfulTurns, busts, avgRollsPerTurn, longestStreak, bustRate }) =>
      ({ seat, finalScore, totalRolls, turnsTaken, successfulTurns, busts, avgRollsPerTurn, longestStreak, bustRate }),
  );
  const passed =
    JSON.stringify(playerValues) === JSON.stringify(check.expected.players) &&
    actual.luckiestSeat === check.expected.luckiestSeat &&
    actual.bestRiskTakerSeat === check.expected.bestRiskTakerSeat;
  console.log(`${passed ? "PASS" : "FAIL"}: ${check.name}`);
  if (!passed) {
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
