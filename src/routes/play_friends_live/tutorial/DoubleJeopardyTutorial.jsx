import { useEffect, useMemo, useRef, useState } from "react";
import Confetti from "react-confetti";
import { Link } from "react-router-dom";
import Navbar from "src/components/Navbar";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import { useLiveGameContext } from "src/context/useLiveGameContext";
import useAudio from "src/hooks/useAudio";
import addPlayerSound from "src/sound_effect/add_player.mp3";
import celebrationSound from "src/sound_effect/celebration.mp3";
import diceRollSound from "src/sound_effect/dice_roll.mp3";
import loseSound from "src/sound_effect/lose_sound.mp3";
import { applyDoubleJeopardyRoll } from "../../../../convex/lib/doubleJeopardyRules";
import CurrentPlayerMobile from "../game/components/CurrentPlayerMobile";
import DoubleJeopardyControls from "../game/components/DoubleJeopardyControls";
import PlayerTable from "../game/components/PlayerTable";
import StatsSection from "../game/components/StatsSection";
import StatsSectionMobile from "../game/components/StatsSectionMobile";

const TUTORIAL_STEPS = [
  { type: "roll", dice: [2, 4] },
  { type: "roll", dice: [3, 2] },
  { type: "pass" },
  { type: "roll", dice: [4, 3] },
  { type: "roll", dice: [1, 3] },
  { type: "roll", dice: [2, 5] },
  { type: "roll", dice: [1, 6] },
  { type: "win_setup" },
  { type: "roll", dice: [2, 3], isWinningRoll: true },
];

const randomDieFace = () => Math.floor(Math.random() * 6) + 1;

function makeTutorialPlayers(pigs, names) {
  return [0, 1].map((index) => ({
    id: `double-jeopardy-tutorial-${index}`,
    avatar: pigs[index],
    tag: names[index],
    name: index === 0 ? "You" : "Practice Opponent",
    running_points: 0,
    total_points: 0,
  }));
}

function resolvePracticeRoll(playerData, currentPlayer, dice, targetScore) {
  const players = playerData.map((player) => ({ ...player }));
  const player = players[currentPlayer];
  const outcome = applyDoubleJeopardyRoll(
    dice[0],
    dice[1],
    player.running_points,
  );

  if (outcome.outcome === "bust") {
    const lostPoints = player.running_points;
    player.running_points = 0;
    return {
      players,
      outcome: "bust",
      lostPoints,
      pointsBanked: 0,
      currentPlayer: (currentPlayer + 1) % players.length,
      won: false,
    };
  }

  if (outcome.outcome === "saved") {
    const pointsBanked = outcome.turnPoints;
    player.total_points += pointsBanked;
    player.running_points = 0;
    const won = player.total_points >= targetScore;
    return {
      players,
      outcome: "saved",
      lostPoints: 0,
      pointsBanked,
      currentPlayer: won ? currentPlayer : (currentPlayer + 1) % players.length,
      won,
    };
  }

  if (player.total_points + outcome.turnPoints >= targetScore) {
    const pointsBanked = outcome.turnPoints;
    player.total_points += pointsBanked;
    player.running_points = 0;
    return {
      players,
      outcome: "continue",
      lostPoints: 0,
      pointsBanked,
      currentPlayer,
      won: true,
    };
  }

  player.running_points = outcome.turnPoints;
  return {
    players,
    outcome: "continue",
    lostPoints: 0,
    pointsBanked: 0,
    currentPlayer,
    won: false,
  };
}

export default function DoubleJeopardyTutorial() {
  const { preloadSrcList, pigPetNames } = useGreedyPigContext();
  const { maxPoints } = useLiveGameContext();
  const pigs = useMemo(
    () => preloadSrcList.filter((src) => src.includes("pig")),
    [preloadSrcList],
  );
  const faces = useMemo(
    () => preloadSrcList.filter((src) => src.includes("dice")),
    [preloadSrcList],
  );
  const targetScore = Math.max(10, Number(maxPoints) || 100);
  const [playerData, setPlayerData] = useState(() =>
    makeTutorialPlayers(pigs, pigPetNames),
  );
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [dice, setDice] = useState(null);
  const [animDice, setAnimDice] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [instruction, setInstruction] = useState(
    "Welcome to Double Jeopardy practice. Click Roll to roll both dice. You can leave at any time without starting a game.",
  );
  const [isWinPending, setIsWinPending] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const animationTimer = useRef(null);
  const animationResolve = useRef(null);
  const rollInProgress = useRef(false);
  const rollAudio = useAudio(diceRollSound);
  const addPlayerAudio = useAudio(addPlayerSound);
  const loseAudio = useAudio(loseSound);
  const celebrationAudio = useAudio(celebrationSound);

  const step = TUTORIAL_STEPS[stepIndex];
  const canRoll = !isComplete && !isWinPending && !isRolling && step?.type === "roll";
  const canPass = !isComplete && !isWinPending && !isRolling && step?.type === "pass";
  const showWinSetup = !isComplete && step?.type === "win_setup";

  useEffect(() => () => {
    if (animationTimer.current) clearInterval(animationTimer.current);
    animationTimer.current = null;
    animationResolve.current?.(false);
    animationResolve.current = null;
  }, []);

  useEffect(() => {
    if (!isWinPending) return undefined;
    const timer = setTimeout(() => {
      setIsWinPending(false);
      setIsComplete(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [isWinPending]);

  function playRollAnimation() {
    return new Promise((resolve) => {
      let ticks = 0;
      animationResolve.current = resolve;
      animationTimer.current = setInterval(() => {
        setAnimDice([randomDieFace(), randomDieFace()]);
        ticks += 1;
        if (ticks >= 10) {
          clearInterval(animationTimer.current);
          animationTimer.current = null;
          animationResolve.current = null;
          resolve(true);
        }
      }, 100);
    });
  }

  async function handleRoll() {
    if (!canRoll || rollInProgress.current) return;
    rollInProgress.current = true;
    setIsRolling(true);
    rollAudio?.play();
    const roll = step.dice;
    const animationFinished = await playRollAnimation();
    if (!animationFinished) return;
    setDice(roll);
    setAnimDice(null);
    setIsRolling(false);
    const result = resolvePracticeRoll(
      playerData,
      currentPlayer,
      roll,
      targetScore,
    );
    const [die1, die2] = roll;
    const sum = die1 + die2;
    const activeName = playerData[currentPlayer].name;

    setPlayerData(result.players);
    setCurrentPlayer(result.currentPlayer);
    setStepIndex((index) => index + 1);

    if (result.outcome === "bust") {
      loseAudio?.play();
      setFeedback({
        tone: "bust",
        text: `Bust! ${die1} + ${die2}. You lose ${result.lostPoints} running points.`,
      });
      setInstruction(
        `A 1 with ${die2} is a bust. Your ${result.lostPoints} running points are lost, and the turn moves to the Practice Opponent. Total points you had already banked remain.`,
      );
    } else if (result.outcome === "saved") {
      addPlayerAudio?.play();
      setFeedback({
        tone: "saved",
        text: `Saved! ${die1} + ${die2}. ${activeName} banks ${result.pointsBanked} points.`,
      });
      setInstruction(
        `The special 1 + 3 combination saves the ${result.pointsBanked} running points ${activeName} had before this roll. The dice add no points, and ${activeName}'s turn ends.`,
      );
    } else if (result.won) {
      celebrationAudio?.play();
      setFeedback({
        tone: "saved",
        text: `You rolled ${die1} + ${die2} = ${sum}.`,
      });
      setInstruction(
        `Both dice added ${sum} points. Your total reached the ${targetScore}-point target, so the game ends and you win.`,
      );
      setIsWinPending(true);
    } else {
      setFeedback({
        tone: "continue",
        text: `You rolled ${die1} + ${die2} = ${sum}.`,
      });
      if (stepIndex === 0) {
        setInstruction(
          `Both dice count: ${die1} + ${die2} added ${sum} running points. You can either roll again to build your points, or pass to bank them. Roll!!`,
        );
      } else if (stepIndex === 1) {
        setInstruction(
          `The second roll adds ${sum}, bringing you to ${result.players[currentPlayer].running_points} running points. Pass banks them and ends your turn. Pass!!`,
        );
      } else if (stepIndex === 3) {
        setInstruction(
          `The Practice Opponent has ${result.players[currentPlayer].running_points} running points. Roll again to see the special 1 + 3 combination.`,
        );
      } else if (stepIndex === 5) {
        setInstruction(
          `You rolled ${die1} + ${die2} and added ${sum} running points. Now see what happens when a different 1 is rolled.`,
        );
      }
    }
    rollInProgress.current = false;
  }

  function handlePass() {
    if (!canPass) return;
    const players = playerData.map((player) => ({ ...player }));
    const player = players[currentPlayer];
    const pointsBanked = player.running_points;
    player.total_points += pointsBanked;
    player.running_points = 0;
    setPlayerData(players);
    setCurrentPlayer((currentPlayer + 1) % players.length);
    setStepIndex((index) => index + 1);
    setFeedback({
      tone: "saved",
      text: `You passed.`,
    });
    setInstruction(
      `Passing banks your ${pointsBanked} running points into total points and ends your turn. The Practice Opponent is now up.`,
    );
    addPlayerAudio?.play();
  }

  function startWinningExample() {
    const players = playerData.map((player) => ({
      ...player,
      running_points: 0,
    }));
    players[0].total_points = targetScore - 5;
    setPlayerData(players);
    setCurrentPlayer(0);
    setStepIndex((index) => index + 1);
    setInstruction(
      `For this short practice example, your total is ${targetScore - 5}. You need a total of 5 or more to reach ${targetScore} and end the game. Roll the dice; `,
    );
    setFeedback(null);
  }

  function restart() {
    setPlayerData(makeTutorialPlayers(pigs, pigPetNames));
    setCurrentPlayer(0);
    setStepIndex(0);
    setDice(null);
    setAnimDice(null);
    setIsRolling(false);
    setFeedback(null);
    setIsWinPending(false);
    setIsComplete(false);
    setInstruction(
      "Welcome to Double Jeopardy practice. Click Roll to roll both dice. You can leave at any time without starting a game.",
    );
  }

  const controlProps = {
    variant: "desktop",
    faces,
    dice: animDice ?? dice,
    busy: isRolling,
    finished: isComplete || isWinPending,
    currentName: playerData[currentPlayer].name,
    runningPoints: playerData[currentPlayer].running_points,
    playerCount: playerData.length,
    maxPoints: targetScore,
    feedback,
    error: "",
    allowRoll: canRoll,
    allowPass: canPass,
    highlightRoll: canRoll,
    highlightPass: canPass,
    wrapFeedback: true,
    onRoll: handleRoll,
    onPass: handlePass,
  };

  return (
    <div className="md:grid md:grid-cols-[minmax(auto,_200px)_1fr_minmax(auto,_200px)] lg:grid-cols-[minmax(auto,_250px)_1fr_minmax(auto,_250px)] xl:grid-cols-[auto_1fr_minmax(auto,_300px)] relative">
      <DoubleJeopardyControls {...controlProps} />
      <div className="space-y-2 p-2">
        <Navbar />
        <PlayerTable playerData={playerData} currentPlayer={currentPlayer} />
        <section className="mt-4 rounded-lg border border-[#ffffff40] bg-[#ffffff10] p-4 text-white" aria-live="polite">
          <p className="mb-2 font-bold text-[#FFEA70]">Double Jeopardy tutorial</p>
          <p>{instruction}</p>
          <p className="mt-2 text-sm opacity-80">Running points: {playerData[currentPlayer].running_points} · Total points: {playerData[currentPlayer].total_points} · Target: {targetScore}</p>
          {showWinSetup && (
            <button type="button" onClick={startWinningExample} className="mt-4 rounded-lg bg-[#D30CBD] px-5 py-3 font-bold ring-4 ring-[#FFEA70] hover:bg-[#d30cbc]">
              Continue to the winning example
            </button>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <button type="button" onClick={restart} disabled={isRolling} className="underline disabled:opacity-50">Restart tutorial</button>
            <Link to="/live-game/setup" className="underline">Exit tutorial</Link>
          </div>
        </section>
      </div>
      <CurrentPlayerMobile playerData={playerData} currentPlayer={currentPlayer} />
      <DoubleJeopardyControls {...controlProps} variant="mobile" />
      <StatsSection playerData={playerData} currentPlayer={currentPlayer} />
      <StatsSectionMobile playerData={playerData} currentPlayer={currentPlayer} />

      {isComplete && (
        <div className="absolute top-0 z-20 flex min-h-screen w-screen items-center justify-center bg-[#000000c0] p-4 text-white">
          <Confetti width={window.innerWidth} height={window.innerHeight} />
          <section className="grid w-[400px] max-w-full place-content-center gap-4 text-center">
            <figure className="flex w-full justify-center">
              <img src={playerData[0].avatar} alt="Your pig" width={300} />
            </figure>
            <p className="pri-font text-5xl capitalize">You win</p>
            <p>You reached {targetScore} total points. Reaching the target ends the game immediately.</p>
            <Link
              to="/live-game/setup"
              replace
              state={{ startGameAfterTutorial: "double_jeopardy" }}
              className="skew-x-6 rounded bg-[#d30cbcc0] px-8 py-4 text-center text-xl font-bold duration-500 hover:scale-95 hover:skew-x-0 hover:bg-[#d30cbc]"
            >
              Start my Double Jeopardy game
            </Link>
            <Link to="/live-game/setup" replace className="rounded bg-[#d30cbcc0] px-8 py-4 text-center text-xl font-bold duration-500 hover:scale-95 hover:skew-x-0 hover:bg-[#d30cbc]">Exit to setup instead</Link>
            <button type="button" onClick={restart} className="underline">Replay tutorial</button>
          </section>
        </div>
      )}
    </div>
  );
}
