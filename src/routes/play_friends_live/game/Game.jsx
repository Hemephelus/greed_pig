import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "src/components/Navbar";
import ErrorBanner from "src/components/ErrorBanner";
import { ERROR_CODES } from "src/constants/game";
import { useGameSession, PHASE } from "src/context/GameSessionContext";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import { SHORTCUTS } from "src/constants/shortcuts";
import { useGameShortcuts, pressShortcutButton } from "src/hooks/useGameShortcuts";
import ShortcutHelp from "src/components/ShortcutHelp";
import { useComputerOpponent } from "src/computer";
import ComputerStatus from "src/computer/ui/ComputerStatus";
import ComputerTurnRecap from "src/computer/ui/ComputerTurnRecap";
import PlayerTable from "./components/PlayerTable";
import StatsSection from "./components/StatsSection";
import GameOver from "./GameOver";
import DiceSection from "./components/DiceSection";
import StatsSectionMobile from "./components/StatsSectionMobile";
import CurrentPlayerMobile from "./components/CurrentPlayerMobile";
import DiceSectionMobile from "./components/DiceSectionMobile";

export default function LiveGame() {
  const { gameId } = useParams();
  const { phase, session, players, activePlayer, error, loadGame } =
    useGameSession();
  // Plays the computer's turns. Must run once here, before the early returns below,
  // because React needs hooks to be called in the same order on every render.
  const computer = useComputerOpponent();
  
  // Keyboard shortcuts (K1). R and B press the real Roll / PASS buttons, so a key
  // can never do more than a click: a disabled button (busy, computer's turn,
  // game over) ignores it. Game keys pause while the help overlay is open.
  const { setHasSound } = useGreedyPigContext();
  const [helpOpen, setHelpOpen] = useState(false);
  // True while the Muddy Trotters target picker is open (K2): it has its own keys
  const [pickerOpen, setPickerOpen] = useState(false);
  useGameShortcuts(
    SHORTCUTS.game,
    {
      roll: () => pressShortcutButton("roll"),
      bank: () => pressShortcutButton("bank"),
      usePowerup1: () => pressShortcutButton("powerup-1"),
      usePowerup2: () => pressShortcutButton("powerup-2"),
      usePowerup3: () => pressShortcutButton("powerup-3"),
      toggleSound: () => setHasSound((on) => !on),
      toggleHelp: () => setHelpOpen((open) => !open),
    },
    { enabled: phase === PHASE.PLAYING && !helpOpen && !pickerOpen }
  );

  // Load the game named in the URL (first visit, refresh, or a different game ID)
  useEffect(() => {
    if (gameId && gameId !== session?.id) {
      loadGame(gameId);
    }
  }, [gameId, session?.id, loadGame]);

  const hasGame = Boolean(gameId) && session?.id === gameId;
  const showError = !gameId || (!hasGame && Boolean(error));
  const showLoading = !showError && (!hasGame || phase === PHASE.LOADING);

  if (showError) {
    const title = !gameId
      ? "No game selected"
      : error?.code === ERROR_CODES.GAME_NOT_FOUND
      ? "Oops, game not found"
      : "Oops, something went wrong";
    const text = !gameId ? "Start a new game to begin playing." : error?.message;

    return (
      <div className="p-2 space-y-2">
        <Navbar />
        <div className="mx-auto mt-10 max-w-md rounded border border-[#ffffff40] bg-[#ffffff10] p-6 text-center text-white space-y-4">
          <h1 className="pri-font text-3xl text-[#FFD700]">{title}</h1>
          <p className="sec-font rounded border border-[#E71D36] bg-[#ffffff10] p-3 text-[#E71D36]">
            {text}
          </p>
          <Link
            to="/live-game/setup"
            className="inline-block w-full md:w-auto sec-font text-xl rounded px-8 py-4 bg-[#D30CBD] hover:bg-[#d30cbcc0] font-bold text-white duration-500"
          >
            Start a new game
          </Link>
        </div>
      </div>
    );
  }

  if (showLoading) {
    return (
      <div className="p-2 space-y-2">
        <Navbar />
        <div className="mx-auto mt-10 max-w-md rounded border border-[#ffffff40] bg-[#ffffff10] p-6 text-center text-white space-y-4">
          <p className="animate-pulse text-5xl">🐷</p>
          <h1 className="pri-font text-3xl">Loading game…</h1>
          <p className="sec-font text-[#F9F7E8]">Fetching your game from the server</p>
        </div>
      </div>
    );
  }

  return (
    <div className="md:grid md:grid-cols-[minmax(auto,_200px)_1fr_minmax(auto,_200px)] lg:grid-cols-[minmax(auto,_250px)_1fr_minmax(auto,_250px)] xl:grid-cols-[auto_1fr_minmax(auto,_300px)] relative">
      <DiceSection locked={computer.isComputerTurn} onPickerChange={setPickerOpen} />
      <div className=" space-y-2 p-2">
        <Navbar />
        <ErrorBanner />
        <ComputerStatus computer={computer} />
        <ComputerTurnRecap computer={computer} />
                <PlayerTable players={players} activePlayer={activePlayer} />
      </div>
      <CurrentPlayerMobile players={players} activePlayer={activePlayer} />
      <DiceSectionMobile locked={computer.isComputerTurn} onPickerChange={setPickerOpen} />

      <StatsSection players={players} activePlayer={activePlayer} />
      <StatsSectionMobile players={players} activePlayer={activePlayer} />
      {phase === PHASE.WON ? <GameOver /> : null}
      {phase !== PHASE.WON ? (
        <ShortcutHelp
          open={helpOpen}
          onOpen={() => setHelpOpen(true)}
          onClose={() => setHelpOpen(false)}
        />
      ) : null}
    </div>
  );
}