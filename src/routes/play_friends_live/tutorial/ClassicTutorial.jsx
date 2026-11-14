import { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Confetti from "react-confetti";
import { Link } from "react-router-dom";
import Navbar from "src/components/Navbar";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import useAudio from "src/hooks/useAudio";
import celebrationSound from "src/sound_effect/celebration.mp3";
import loseSound from "src/sound_effect/lose_sound.mp3";
import { Dice } from "src/components/Dice";
import PlayerTable from "../game/components/PlayerTable";
import StatsSection from "../game/components/StatsSection";
import StatsSectionMobile from "../game/components/StatsSectionMobile";
import CurrentPlayerMobile from "../game/components/CurrentPlayerMobile";

const PRACTICE_ROLLS = [4, 3, 2, 5, 1];

const makePlayers = (pigs, names) => [0, 1].map((index) => ({
  id: `tutorial-player-${index}`,
  avatar: pigs[index],
  tag: names[index],
  name: index === 0 ? "You" : "Practice Opponent",
  pig_index: index,
  running_points: 0,
  total_points: 0,
}));

export default function ClassicTutorial() {
  const { preloadSrcList, pigPetNames } = useGreedyPigContext();
  const celebrationAudio = useAudio(celebrationSound);
  const loseAudio = useAudio(loseSound);
  const pigs = useMemo(() => preloadSrcList.filter((src) => src.includes("pig")), [preloadSrcList]);
  const [players, setPlayers] = useState(() => makePlayers(pigs, pigPetNames));
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [rollIndex, setRollIndex] = useState(0);
  const [diceValue, setDiceValue] = useState(0);
  const [isRollingDesktop, setIsRollingDesktop] = useState(false);
  const [isRollingMobile, setIsRollingMobile] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showWinningSetup, setShowWinningSetup] = useState(false);
  const [winExampleReady, setWinExampleReady] = useState(false);
  const [message, setMessage] = useState("Welcome! This practice game will teach you how to play the classic mode. Click the die to start.");

  const isRolling = isRollingDesktop || isRollingMobile;
  const canPass = rollIndex === 3 && !isRolling && !isComplete;
  const isWinStage = winExampleReady && !isComplete;
  const canRoll = !isRolling && !isComplete && !showWinningSetup && (rollIndex !== 3 || isWinStage);

  const getNextRoll = useCallback(() => PRACTICE_ROLLS[rollIndex] ?? 4, [rollIndex]);

  const handleRoll = useCallback((value) => {
    setDiceValue(value);
    const nextPlayers = players.map((player) => ({ ...player }));
    const player = nextPlayers[currentPlayer];

    if (isWinStage) {
      celebrationAudio?.play();
      player.running_points += value;
      setPlayers(nextPlayers);
      setIsComplete(true);
      setMessage(`You rolled ${value}. Your score is now ${player.total_points + player.running_points}—100 or more wins!`);
      return;
    }

    if (value === 1) {
      loseAudio?.play();
      const lostPoints = player.running_points;
      player.running_points = 0;
      const nextPlayer = (currentPlayer + 1) % nextPlayers.length;
      setPlayers(nextPlayers);
      setCurrentPlayer(nextPlayer);
      setRollIndex((index) => index + 1);
      setShowWinningSetup(true);
      setMessage(`Practice opponent rolled 1. Their ${lostPoints} running points are lost, and it’s now your turn to roll. The die automatically advanced the turn.`);
      return;
    }

    player.running_points += value;
    setPlayers(nextPlayers);
    setRollIndex((index) => index + 1);
    if (rollIndex === 0) {
      setMessage(`You rolled ${value}. It is added to your running points. You can either roll again and take a chance to increase your total, or pass to the next player.`);
    } else if (rollIndex === 2) {
      setMessage(`Your running points are ${player.running_points}. Pass to bank all ${player.running_points} points.`);
    } else if (isWinStage) {
      setMessage(`You rolled ${value}. Your score is now ${player.total_points + player.running_points}—100 or more wins!`);
    } else {
      setMessage(`You rolled ${value}; it adds to your running points, which is now ${player.running_points}. You can keep rolling.`);
    }
  }, [celebrationAudio, currentPlayer, isWinStage, loseAudio, players, rollIndex]);

  const handlePass = () => {
    if (!canPass) return;
    const nextPlayers = players.map((player) => ({ ...player }));
    const player = nextPlayers[currentPlayer];
    const banked = player.running_points;
    player.total_points += banked;
    player.running_points = 0;
    setPlayers(nextPlayers);
    setCurrentPlayer((currentPlayer + 1) % nextPlayers.length);
    setRollIndex((index) => index + 1);
    setMessage(`You passed and banked ${banked} points. Your total points now include them, and the next player's turn begins. Roll for the next player.`);
  };

  const restart = () => {
    setPlayers(makePlayers(pigs, pigPetNames));
    setCurrentPlayer(0);
    setRollIndex(0);
    setDiceValue(0);
    setIsRollingDesktop(false);
    setIsRollingMobile(false);
    setIsComplete(false);
    setShowWinningSetup(false);
    setWinExampleReady(false);
    setMessage("Welcome back! Click the die to start the Classic practice game.");
  };

  const startWinningExample = () => {
    const nextPlayers = players.map((player) => ({ ...player, running_points: 0 }));
    nextPlayers[0].total_points = 96;
    setPlayers(nextPlayers);
    setCurrentPlayer(0);
    setShowWinningSetup(false);
    setWinExampleReady(true);
    setMessage("For this short final example, your practice score is set to 96. Roll the die to see whether the total reaches the 100-point winning target.");
  };

  const rollPrompt = isWinStage
    ? "Roll the final 4 to reach 100 and win"
    : showWinningSetup
      ? "Next player is taking a turn"
    : rollIndex < PRACTICE_ROLLS.length
      ? `Roll the die${rollIndex === 4 ? " for the next player" : ""}`
      : "Tutorial complete";

  return (
    <div className="md:grid md:grid-cols-[minmax(auto,_200px)_1fr_minmax(auto,_200px)] lg:grid-cols-[minmax(auto,_250px)_1fr_minmax(auto,_250px)] xl:grid-cols-[auto_1fr_minmax(auto,_300px)] relative">
      <aside className="h-screen border-r-[#ffffff40] border-r hidden md:flex flex-col items-center justify-around p-8 sticky top-0 bg-[#00000010]">
        <p className="text-white text-center text-sm">{rollPrompt}</p>
        <Dice
          getFinalDiceValue={handleRoll}
          getRollValue={getNextRoll}
          setIsRolling={setIsRollingDesktop}
          isRolling={isRollingDesktop}
          setChangeBackground={() => {}}
          disabled={!canRoll}
          buttonClassName={canRoll ? "ring-4 ring-[#FFEA70] rounded-lg" : ""}
        />
        <button type="button" id="tutorial-pass" disabled={!canPass} onClick={handlePass} className={`bg-[#056FA4c0] w-full text-white text-center text-base lg:text-xl font-semibold py-2 lg:py-4 rounded-lg border duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${canPass ? "ring-4 ring-[#FFEA70]" : ""}`}>
          PASS
        </button>
        <TutorialLinks onRestart={restart} />
        <p className="text-white text-center text-sm">2 players · 100 max points</p>
      </aside>

      <div className="space-y-2 p-2">
        <Navbar />
        <PlayerTable playerData={players} currentPlayer={currentPlayer} />
        <section className="text-white bg-[#ffffff10] border border-[#ffffff40] rounded-lg p-4 mt-4" aria-live="polite">
          <p className="font-bold text-[#FFEA70] mb-2">Classic tutorial</p>
          <p>{message}</p>
          <p className="text-sm mt-2 opacity-80">Die: {diceValue || "—"} · Running points: {players[currentPlayer].running_points} · Total points: {players[currentPlayer].total_points + players[currentPlayer].running_points}</p>
          {isWinStage && !isComplete && <p className="mt-2 text-[#FFEA70]">You are at 96 points. You need 4 on the next roll to finish the game; click the die to roll.</p>}
          {showWinningSetup && <button type="button" onClick={startWinningExample} className="mt-4 bg-[#D30CBD] hover:bg-[#d30cbc] font-bold px-5 py-3 rounded-lg">Continue to the 100-point example</button>}
          <div className="md:hidden flex flex-col items-center gap-3 mt-4">
            <p className="text-sm">{rollPrompt}</p>
            <Dice getFinalDiceValue={handleRoll} getRollValue={getNextRoll} setIsRolling={setIsRollingMobile} isRolling={isRollingMobile} setChangeBackground={() => {}} disabled={!canRoll} buttonClassName={canRoll ? "ring-4 ring-[#FFEA70] rounded-lg" : ""} />
            <button type="button" disabled={!canPass} onClick={handlePass} className={`bg-[#056FA4c0] w-full text-white text-center font-semibold py-3 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed ${canPass ? "ring-4 ring-[#FFEA70]" : ""}`}>PASS</button>
            <TutorialLinks onRestart={restart} />
          </div>
        </section>
      </div>
      <CurrentPlayerMobile playerData={players} currentPlayer={currentPlayer} />
      <StatsSection playerData={players} currentPlayer={currentPlayer} />
      <StatsSectionMobile playerData={players} currentPlayer={currentPlayer} />

      {isComplete && (
        <div className="min-h-screen w-screen absolute bg-[#000000c0] flex justify-center items-center text-white top-0 z-20 p-4">
          <Confetti width={window.innerWidth} height={window.innerHeight} />
          <section className="grid place-content-center gap-4 w-[400px] max-w-full text-center">
            <figure className="flex justify-center w-full">
              <img src={players[0].avatar} alt="Your pig" width={300} />
            </figure>
            <p className="text-center text-5xl pri-font capitalize">You win</p>
            <p>You reached 100 points. Reaching the target ends the game immediately.</p>
            <Link
              to="/live-game/setup"
              replace
              state={{ startClassicAfterTutorial: true }}
              className="text-center sec-font text-xl rounded px-8 py-4 bg-[#d30cbcc0] font-bold duration-500 skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc]"
            >
              Start game
            </Link>
            <Link to="/live-game/setup" replace className="text-center sec-font text-xl rounded px-8 py-4 bg-[#d30cbcc0] font-bold duration-500 -skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc]">Exit to setup instead</Link>
          </section>
        </div>
      )}
    </div>
  );
}

function TutorialLinks({ onRestart }) {
  return (
    <div className="flex flex-col gap-2 text-white text-center text-sm w-full">
      <button type="button" onClick={onRestart} className="underline">Restart tutorial</button>
      <Link to="/live-game/setup" className="underline">Exit tutorial</Link>
    </div>
  );
}

TutorialLinks.propTypes = {
  onRestart: PropTypes.func.isRequired,
};
