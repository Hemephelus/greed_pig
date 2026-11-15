import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "src/components/Navbar";
import ErrorBanner from "src/components/ErrorBanner";
import SoundSwitch from "src/components/SoundSwitch";
import { useGameSession } from "src/context/GameSessionContext";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import { useLiveGameContext } from "src/context/useLiveGameContext";
import {
  DEFAULT_TARGET,
  MAX_NAME_LENGTH,
  MAX_TARGET,
  MIN_TARGET,
} from "src/constants/game";
import {
  buildVsComputerPlayers,
  DEFAULT_LEVEL,
  DIFFICULTY_LEVELS,
  getDifficulty,
} from "src/computer";
import ImageSlider from "src/routes/play_friends_live/setup/components/ImageSlider";
import DifficultyCard from "./DifficultyCard";

// "You vs Computer" setup at /live-game/vs-computer (task C1).
// The player picks a name, a pig, a difficulty, a max score and who goes first.
// "Play" builds the player list and asks the server to create the game.
// Note: this page deliberately has no <form>. ImageSlider's arrow buttons have no
// type="button", so inside a form every arrow click would submit it and start the game.
export default function ComputerSetup() {
  const navigate = useNavigate();
  const { startGame, isBusy, clearError } = useGameSession();
  const { pigPetNames } = useGreedyPigContext();
  // ImageSlider reads and writes the first seat of this shared list,
  // so seat 0 is "you" and its pig_index is the pig you picked.
  const { playerData, setDiceValue } = useLiveGameContext();
  const humanSeat = playerData[0];

  const [humanName, setHumanName] = useState("");
  const [level, setLevel] = useState(DEFAULT_LEVEL);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [humanGoesFirst, setHumanGoesFirst] = useState(true);

  const opponent = getDifficulty(level);

  async function handleStart() {
    clearError();
    setDiceValue(0); // reset the background glow left over from a previous bust

    const setupPlayers = buildVsComputerPlayers({
      humanName,
      humanPigIndex: humanSeat?.pig_index ?? 0,
      level,
      pigPetNames,
      humanGoesFirst,
    });

    // startGame validates, calls POST /game/create and returns the game id (or null on error)
    const gameId = await startGame({ setupPlayers, winningTarget: target });
     if (gameId) {
      navigate(`/live-game/game/${gameId}`);
    } else {
      // The error banner sits at the top of the page, so scroll up to show it
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <main>
      <Navbar />
      <div className="flex flex-col items-center gap-8 px-[5%] py-4 text-white md:px-[10%]">
        <ErrorBanner />

        <section className="flex w-full flex-col items-center gap-3 rounded-lg border border-[#FFFFFF40] bg-[#ffffff10] p-4 sm:w-[300px]">
          <h2 className="pri-font text-xl">You</h2>
          {humanSeat && <ImageSlider player={humanSeat} index={0} />}
          <input
            type="text"
            value={humanName}
            maxLength={MAX_NAME_LENGTH}
            onChange={(e) => setHumanName(e.target.value)}
            placeholder={pigPetNames?.[0] ?? "Enter Name"}
            className="w-full border-b border-b-[#FFFFFF40] bg-transparent p-0.5 text-center text-lg font-medium"
          />
        </section>

        <section className="flex w-full max-w-4xl flex-col gap-3">
          <h2 className="pri-font text-center text-xl">Choose your opponent</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DIFFICULTY_LEVELS.map((d) => (
              <DifficultyCard
                key={d.level}
                difficulty={d}
                selected={level === d.level}
                onSelect={() => setLevel(d.level)}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="flex flex-col">
            Max Score ({MIN_TARGET}–{MAX_TARGET})
            <input
              type="number"
              min={MIN_TARGET}
              max={MAX_TARGET}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-[250px] rounded-md border bg-[#ffffff20] p-2"
            />
          </label>
          <label className="flex items-center gap-2 p-2">
            <input
              type="checkbox"
              checked={humanGoesFirst}
              onChange={(e) => setHumanGoesFirst(e.target.checked)}
              className="h-5 w-5 accent-[#D30CBD]"
            />
            I go first
          </label>
          <SoundSwitch />
        </section>

        <button
          type="button"
          onClick={handleStart}
          disabled={isBusy}
          className="sec-font rounded bg-[#D30CBD] px-16 py-4 text-xl font-bold duration-500 skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {isBusy ? "Creating game…" : `Play vs ${opponent?.pigName ?? "Computer"}`}
        </button>
      </div>
    </main>
  );
}