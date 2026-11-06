# Power-ups

Rules for the power-ups improvement in Greedy Pig Reimagined. The server (`convex/game.js`) is the only place these rules are applied. The browser only asks to roll, pass or use a power-up, and shows the result.

## Earning and holding

- You earn **one random power-up** when you **roll a 6**.
- You can hold **at most 2** at a time. If you already hold 2, a 6 earns nothing.
- The roll that wins the game earns nothing.
- Power-ups are single use.

## Using a power-up

- Only on **your own turn**, while the game is in progress.
- You can use one at any moment of your turn, including before your first roll.
- Using one never ends your turn. Roll or Pass as normal afterwards.

## The four power-ups

| ID | Name | Effect |
|---|---|---|
| `shield` | Shield | Arms a shield. The next time you roll a 1, you keep your running points and your turn continues. The shield is then used up. It stays armed until it saves you once. |
| `double` | Double Down | Your next roll counts double. If that roll is a 1, the bonus is lost along with your running points (unless a shield is armed). |
| `freeze` | Freeze | The next player, in the current direction of play, skips their next turn. You cannot freeze a player who is already frozen. |
| `reverse` | Reverse | Flips the direction of play, like the Uno card. With 3 or more players, the turn goes to the player on your other side when your turn ends. With only 2 players it works like a skip, so you play again. |

## How they interact

- **Shield + a roll of 1:** running points are kept, the turn continues, the shield is used up, and any armed Double Down is cleared.
- **Double Down + a roll of 1 (no shield):** you bust as normal. The Double Down is lost.
- **Double Down stays armed until your next roll**, even if you arm it after rolling and then pass.
- **Freeze + Reverse:** Freeze always targets the next player in the direction of play at the moment you use it.
- **Winning:** if a doubled roll takes you to the max score, you win as normal.

## Where it lives in the code

| What | Where |
|---|---|
| Earning a power-up | `roll` mutation in `convex/game.js` |
| Using a power-up | `activatePowerUp` mutation in `convex/game.js` |
| Skipping frozen players and the direction of play | `advanceTurn` helper in `convex/game.js` |
| Held power-ups | `roomPlayers.powerUps` (array of IDs: `"shield"`, `"double"`, `"freeze"`, `"reverse"`) |
| Active effects | `roomPlayers.shieldArmed`, `roomPlayers.doubleArmed`, `roomPlayers.frozen` |
| Direction of play | `rooms.direction` (`1` = normal, `-1` = reversed, missing means `1`) |
| History of use | `turns` rows with `action: "powerUp"` and the power-up ID in `detail` |

`roll` returns `{ value, gained, busted, won, earned, shielded }`, so the screen can show messages such as "You earned Freeze!" or "Your shield saved you!".

## What the screen should show

- A **tray** with the power-ups you hold and a button to use each one.
- A **badge** next to a player when `shieldArmed`, `doubleArmed` or `frozen` is true.
- A **direction arrow** based on `rooms.direction`, as in Uno.
- A short message when you earn, use or are hit by a power-up.

## Testing

Waiting for a 6 is slow, so there is a testing-only mutation, `devGrant`. It only works when the environment variable `ALLOW_DEV_TOOLS` is `"true"`, which is set on the dev deployment only and never on production.

```bash
npx convex env set ALLOW_DEV_TOOLS true
```

Use the temporary page at `/engine-test` to grant and use each power-up. Reverse needs three players to test the direction change.
