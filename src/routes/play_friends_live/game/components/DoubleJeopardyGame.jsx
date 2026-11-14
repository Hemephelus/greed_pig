import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Navbar from "src/components/Navbar";
import { useLiveGameContext } from "src/context/useLiveGameContext";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import useAudio from "src/hooks/useAudio";
import diceRollSound from "src/sound_effect/dice_roll.mp3";
import addPlayerSound from "src/sound_effect/add_player.mp3";
import loseSound from "src/sound_effect/lose_sound.mp3";
import celebrationSound from "src/sound_effect/celebration.mp3";
import PlayerTable from "./PlayerTable";
import StatsSection from "./StatsSection";
import StatsSectionMobile from "./StatsSectionMobile";
import CurrentPlayerMobile from "./CurrentPlayerMobile";
import DoubleJeopardyControls from "./DoubleJeopardyControls";
import GameOver from "../GameOver";

const randomFace = () => Math.floor(Math.random() * 6) + 1;

export default function DoubleJeopardyGame() {
  const {
    gameId,
    setChangeBackground,
    setDiceValue,
    setIsContinue,
    logRoll,
    logPass,
  } = useLiveGameContext();
  const { preloadSrcList } = useGreedyPigContext();
  const faces = preloadSrcList.filter((src) => src.includes("dice"));

  const liveGame = useQuery(api.games.getGame, gameId ? { gameId } : "skip");
  const rollDice = useMutation(api.games.rollDoubleJeopardy);
  const passTurn = useMutation(api.games.passTurn);

  const rollAudio = useAudio(diceRollSound);
  const addPlayerAudio = useAudio(addPlayerSound);
  const loseAudio = useAudio(loseSound);
  const celebrationAudio = useAudio(celebrationSound);

  const [busy, setBusy] = useState(false);
  const [frozenGame, setFrozenGame] = useState(null);
  const [animFaces, setAnimFaces] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState("");

  // While a roll is animating, show the game as it was before the roll,
  // so the scoreboard doesn't reveal the result early.
  const game = busy ? frozenGame : liveGame;

  function playRollAnimation() {
    return new Promise((resolve) => {
      let ticks = 0;
      const timer = setInterval(() => {
        setAnimFaces([randomFace(), randomFace()]); // visual only
        ticks += 1;
        if (ticks >= 10) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  }

  async function handleRoll() {
    if (busy || !liveGame || liveGame.status !== "active") return;
    setFrozenGame(liveGame);
    setBusy(true);
    setFeedback(null);
    setError("");
    setChangeBackground(true);
    rollAudio?.play();
    const animation = playRollAnimation();

    try {
      // The real dice are rolled on the Convex server.
      const result = await rollDice({ gameId });
      await animation;

      const player = liveGame.players[result.playerIndex];
      const name = player.name;
      logRoll(
        result.playerIndex,
        [result.die1, result.die2],
        result.outcome === "bust",
      );
      if (result.outcome === "saved" && result.status === "active") {
        logPass(result.playerIndex, result.pointsBanked);
      }

      setDiceValue(result.outcome === "bust" ? 1 : 0);

      if (result.status === "finished") {
        celebrationAudio?.play();
        setFeedback({
          tone: "saved",
          text:
            result.pointsBanked > 0
              ? `Saved! ${result.die1} + ${result.die2}. ${name} keeps ${result.pointsBanked} points.`
              : `${result.die1} + ${result.die2}: nothing to save, ${name}'s turn ends.`,
        });
      } else if (result.outcome === "bust") {
        loseAudio?.play();
        const lost = player.runningPoints;
        setFeedback({
          tone: "bust",
          text:
            lost > 0
              ? `Bust! ${name} loses ${lost} points.`
              : `Bust! ${name}'s turn is over.`,
        });
      } else if (result.outcome === "saved") {
        setFeedback({
          tone: "saved",
          text: `Saved! ${result.die1} + ${result.die2}. ${name} banks ${result.pointsBanked} points.`,
        });
      } else {
        setFeedback({
          tone: "continue",
          text: `${name} rolled ${result.die1} + ${result.die2} = ${
            result.die1 + result.die2
          }.`,
        });
      }
    } catch (err) {
      await animation;
      setError("Couldn't roll the dice. Check your connection and try again.");
    } finally {
      setAnimFaces(null);
      setChangeBackground(false);
      setBusy(false);
    }
  }

  async function handlePass() {
    if (busy || !liveGame || liveGame.status !== "active") return;
    setFrozenGame(liveGame);
    setBusy(true);
    setFeedback(null);
    setError("");

    try {
      const result = await passTurn({ gameId });
      const name = liveGame.players[result.playerIndex].name;
      if (result.status === "active") {
        logPass(result.playerIndex, result.pointsBanked);
      }
      setDiceValue(0);

      if (result.status === "finished") {
        celebrationAudio?.play();
        setFeedback({
          tone: "saved",
          text: `${name} reached ${liveGame.targetScore} points and wins!`,
        });
      } else {
        addPlayerAudio?.play();
        setFeedback({
          tone: "continue",
          text: `${name} banked ${result.pointsBanked} points.`,
        });
      }
    } catch (err) {
      setError("Couldn't pass the turn. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!gameId || game === null) {
    return (
      <div className="min-h-screen grid place-content-center gap-4 text-white text-center p-4">
        <p>We couldn&apos;t find this game.</p>
        <Link to="/live-game/setup" className="underline">
          Back to setup
        </Link>
      </div>
    );
  }

  if (game === undefined) {
    return (
      <div
        role="status"
        className="min-h-screen grid place-content-center text-white"
      >
        Loading game...
      </div>
    );
  }

  // Convert the server's shape into the shape the existing scoreboard
  // components already understand.
  const playerData = game.players.map((player, index) => ({
    id: index,
    avatar: player.avatar,
    tag: player.name,
    name: player.name,
    running_points: player.runningPoints,
    total_points: player.totalPoints,
  }));
  const currentPlayer = game.currentPlayerIndex;
  const finished = game.status === "finished";
  const dice =
    animFaces ??
    (game.lastRoll ? [game.lastRoll.die1, game.lastRoll.die2] : null);

  const controlProps = {
    faces,
    dice,
    busy,
    finished,
    currentName: game.players[currentPlayer].name,
    runningPoints: game.players[currentPlayer].runningPoints,
    playerCount: game.players.length,
    maxPoints: game.targetScore,
    feedback,
    error,
    onRoll: handleRoll,
    onPass: handlePass,
  };

  return (
    <div className="md:grid md:grid-cols-[minmax(auto,_200px)_1fr_minmax(auto,_200px)] lg:grid-cols-[minmax(auto,_250px)_1fr_minmax(auto,_250px)] xl:grid-cols-[auto_1fr_minmax(auto,_300px)] relative">
      <DoubleJeopardyControls variant="desktop" {...controlProps} />
      <div className="space-y-2 p-2">
        <Navbar />
        <PlayerTable playerData={playerData} currentPlayer={currentPlayer} />
      </div>
      <CurrentPlayerMobile
        playerData={playerData}
        currentPlayer={currentPlayer}
      />
      <DoubleJeopardyControls variant="mobile" {...controlProps} />

      <StatsSection playerData={playerData} currentPlayer={currentPlayer} />
      <StatsSectionMobile
        playerData={playerData}
        currentPlayer={currentPlayer}
      />
      {finished && !busy && (
        <GameOver
          playerData={playerData}
          currentPlayer={currentPlayer}
          setIsContinue={setIsContinue}
        />
      )}
    </div>
  );
}
