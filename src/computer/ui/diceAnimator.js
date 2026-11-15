// A small "switchboard" between the computer and the on-screen die.
//
// The problem: the computer rolls from useComputerOpponent (a hook), but the animated
// die lives in the Dice component. Without a link between them the computer's roll
// reaches the server and the scoreboard, yet the die on screen never moves.
//
// How it works:
//   - Every <Dice> registers itself here when it appears on screen.
//   - Before the computer asks the server for a roll, it calls rollWithAnimation(request).
//   - We find the die the player can actually see and ask it to run its normal roll:
//     shuffle with sound, ask the server, land on the server's number, red flash on a 1.
//   - The result is passed back, so the computer still gets the server's answer.
//
// Nothing here picks a number. The server still rolls the die.

// All dice currently on screen. The game screen renders two (desktop and phone
// layout), and CSS hides one of them.
const registeredDice = new Set();

// Called by <Dice> in an effect. Returns the function that removes it again.
//   entry.isVisible() -> true if this die is shown to the player
//   entry.run(request) -> plays the roll and resolves with the server's response
export function registerDice(entry) {
  registeredDice.add(entry);
  return () => registeredDice.delete(entry);
}

// request: a function that asks the server for the roll and returns its promise,
// e.g. () => roll({ byComputer: true }).
// Resolves with the server's response, or null if the roll failed.
export function rollWithAnimation(request) {
  const visibleDie = [...registeredDice].find((die) => die.isVisible());
  // No die on screen (should not happen on the game page): roll without animation
  return visibleDie ? visibleDie.run(request) : request();
}