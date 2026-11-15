# Greedy Pig Reimagined

**CSC 419: Advances in Web, Mobile and Blockchain Development**
Pan-Atlantic University, School of Science and Technology, Department of Computer Science
Academic session 2026/2027 (First Semester) | **Group 1**

- **Live URL:** https://greed-pig-iota.vercel.app/

## Team

| Name | Matric number | Improvement | Category |
|---|---|---|---|
| Flourish | `<matric number>` | 1. Game Tutorial | Accessibility and Experience |
| Esuga | `<matric number>` | 2. Double Jeopardy | Gameplay and Rules |
| Victoria Falowo | 23120112022 | 3. Game Statistics | Competition |

## About the project

Greedy Pig is a push-your-luck dice game. On your turn you keep rolling until you decide to pass and bank your points, or you roll something that wipes out the points you were holding. This project improves the base game in three ways, each from a different category, and backs it with a Convex database and API, deployed on Vercel.

Base game: <https://greedy-pig.vercel.app/> | Base repo: <https://github.com/Hemephelus/greed_pig>

## Improvements

1. **Game Tutorial (Accessibility and Experience):**
2. **Double Jeopardy (Gameplay and Rules):** 
3. **Game Statistics (Competition):** .

---
## Improvement 1: Game Tutorial
 `<Flourish: add what you built, how it works, and your files here>`
 
## Improvement 2: Double Jeopardy
 `<The Destroyer: add the rules, how it works, and your files here>`
 

## Improvement 3: Game Statistics (Victoria Falowo, 23120112022)

### What the player sees

When a game ends, the winner screen offers **Play Again**, **Home** and **View Stats**. 

**View Stats** opens a popup with:

- **Awards.** Two main awards, **Luckiest** and **Risk Taker**, plus extra awards (Cursed, Jackpot, Heartbreaker and, in Double Jeopardy, Close Call). Each extra award is shown as a card with the winner, the number behind it and an explanation. An award nobody qualifies for is hidden.
- **A card for every player** with their final points, successful turns, busts and total dice rolls.

Stats work in both game modes (Classic and Double Jeopardy). They are per game only.

If the stats can't be saved (for example, the connection drops), the player sees "Couldn't save your stats" with a **Retry** button, and Play Again and Home keep working.

### Awards

| Award | Goes to | How it is worked out |
|---|---|---|
| **Luckiest** | The player who busted least often | Lowest bust rate (busts divided by rolls) among players with at least 5 rolls. If nobody has 5 rolls, everyone is considered. Ties go to the higher score. |
| **Risk Taker** | The player who pushed their luck most | Highest average number of rolls per turn. Ties go to the longest streak. |
| **Cursed** | The unluckiest player | Highest bust rate among players with at least 5 rolls and at least 1 bust. Ties go to the lower score. |
| **Jackpot** | Biggest single payday | Most points banked in one turn. |
| **Heartbreaker** | The most painful bust | Most points lost in a single bust (the dice rolled earlier in that turn). |
| **Close Call** (Double Jeopardy only) | The narrow-save specialist | Most turns saved by rolling a 1 and a 3 together. |

### How it works

1. **Recording (browser).** While a game is played, a small recorder (`src/utils/live_game/gameLog.js`, exposed through `LiveGameContext` in `LivePage.jsx`) writes down every roll, pass and bust. A game log holds the mode, target score, players and a list of turns. Each turn has the dice rolled, how the turn ended (`banked` or `bust`) and the points banked. In Classic, the recorder is called from the roll and pass handlers in `DiceSection.jsx` and `DiceSectionMobile.jsx`. In Double Jeopardy, it is called from `DoubleJeopardyGame.jsx`, using the results the server sends back. The recorder only writes things down and does not change how the game plays.
2. **Saving (automatic).** When the game ends, `GameOver.jsx` finishes the log and sends it to Convex with the `saveGame` mutation.
3. **Checking and calculating (server).** `saveGame` (`convex/stats.js`) does not accept stats from the browser. It checks that the log is valid and then works out every statistic itself in `convex/lib/computeStats.js`. A game saved twice (for example, a repeated request) is stored once, using the unique `clientGameId` created at the start of each game.
4. **Showing (browser).** The popup reads the saved results with the `getGameStats` query.

### Backend

**Database tables** (`convex/schema.js`):

- `finishedGames`: one document per completed game, with the mode, target score, player count, winner, award winners and the full list of turns. It has an index on `clientGameId`.
- `playerStats`: one document per player per game, with final score, total rolls, turns taken, successful turns, busts, average rolls per turn, longest streak and bust rate. It has an index on the game it belongs to.

**Endpoints** (`convex/stats.js`):

| Function | Type | What it does |
|---|---|---|
| `saveGame` | mutation | Validates a finished game's log, calculates the stats and stores them. |
| `getGameStats` | query | Returns a saved game and its players' stats (returns nothing for an unknown id). |
| `listRecentGames` | query | Returns the 10 most recent finished games. Not shown in the interface yet. |
| `seedFakeGame` | internal mutation | Adds two sample games (one per mode) for testing. Run with `npx convex run stats:seedFakeGame`. |

### Testing

`npm run test:stats` runs `scripts/test-stats.mjs`, which checks the stat calculations and all the awards on hand-made games. These include a game where a player never rolled, ties, and a game where nobody qualifies for an award.

---

## How to run the project



### Deployment

- **Backend:** `npx convex deploy` publishes the functions and schema to the production Convex deployment.
- **Frontend:** Vercel builds the site from the main branch. Set the environment variable `VITE_CONVEX_URL` in Vercel to the production Convex URL.

---
