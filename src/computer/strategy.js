// The computer's brain: decides whether to ROLL again or BANK.
// Pure function (no React, no API), so it is easy to test and tune.
//
// Maths behind the numbers (one die, rolling a 1 = bust):
//   chance of bust       = 1/6 ≈ 17%
//   average safe roll    = (2+3+4+5+6) / 5 = 4 points
//   rolling again is worth it while  (5/6) * 4  >  (1/6) * turn_score
//   => break-even turn score = 20 ("hold at 20"). That's the Medium level's rule.

import { MAX_LEVEL, MIN_LEVEL } from "./difficulty";

export const MOVES = Object.freeze({ ROLL: "ROLL", BANK: "BANK" });

export const BREAK_EVEN_TURN_SCORE = 20;

// A turn score that a good player can usually reach in one turn (used to judge "danger")
const ONE_GOOD_TURN = 20;

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/**
 * @param {object}   ctx
 * @param {object}   ctx.me         the computer player ({ total_score, turn_score })
 * @param {object[]} ctx.opponents  everyone else ({ total_score })
 * @param {number}   ctx.target     session.winning_target
 * @param {number}   ctx.level      1 (Very Easy) … 5 (Expert)
 * @param {Function} [ctx.random]   0..1 random function (pass a fixed one in tests)
 * @returns {"ROLL" | "BANK"}
 */
export function decideMove({ me, opponents = [], target, level, random = Math.random }) {
  const turn = me.turn_score;
  const needBeforeTurn = target - me.total_score; // points still needed to win
  const canWinByBanking = turn >= needBeforeTurn;
  const leader = opponents.reduce((max, p) => Math.max(max, p.total_score), 0);

  // Nothing to lose yet: always roll at least once
  if (turn === 0) return MOVES.ROLL;

  const lvl = clamp(Math.round(level) || MIN_LEVEL, MIN_LEVEL, MAX_LEVEL);

  // Level 1: coin flip, even when it could bank the win (that's what makes it very easy)
  if (lvl === 1) {
    if (canWinByBanking && random() < 0.5) return MOVES.BANK;
    return random() < 0.4 ? MOVES.BANK : MOVES.ROLL;
  }

  // Every other level always takes a win
  if (canWinByBanking) return MOVES.BANK;

  switch (lvl) {
    // Level 2: banks at 10, makes a random choice 15% of the time
    case 2: {
      if (random() < 0.15) return random() < 0.5 ? MOVES.BANK : MOVES.ROLL;
      return turn >= 10 ? MOVES.BANK : MOVES.ROLL;
    }

    // Level 3: the fixed break-even rule
    case 3:
      return turn >= BREAK_EVEN_TURN_SCORE ? MOVES.BANK : MOVES.ROLL;

    // Level 4: break-even rule, adjusted by how far behind/ahead it is
    case 4: {
      const gap = leader - me.total_score; // > 0 means behind
      const threshold = BREAK_EVEN_TURN_SCORE + clamp(gap / 5, -5, 8);
      return turn >= threshold ? MOVES.BANK : MOVES.ROLL;
    }

    // Level 5: level 4 + end-game thinking
    default: {
      const gap = leader - me.total_score;
      const remainingAfterBank = needBeforeTurn - turn;
      const opponentAboutToWin = target - leader <= ONE_GOOD_TURN;

      // An opponent will probably win next turn: keep rolling if the win is within reach
      if (opponentAboutToWin && remainingAfterBank <= 25) return MOVES.ROLL;

      // Banking now leaves an easy finish next turn: lock it in
      if (!opponentAboutToWin && remainingAfterBank <= 8 && turn >= 10) return MOVES.BANK;

      let threshold = BREAK_EVEN_TURN_SCORE + clamp(gap / 4, -5, 10);
      if (opponentAboutToWin) threshold += 8;
      return turn >= threshold ? MOVES.BANK : MOVES.ROLL;
    }
  }
}
