import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "src/components/Navbar";
import ErrorBanner from "src/components/ErrorBanner";
import { useGameSession } from "src/context/GameSessionContext";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import { DEFAULT_TARGET, MAX_TARGET, MIN_TARGET } from "src/constants/game";
import { buildVsComputerPlayers, DEFAULT_LEVEL, DIFFICULTY_LEVELS } from "src/computer";

// "You vs Computer" setup at /live-game/vs-computer. It WORKS, but it's deliberately plain.
// C1 (see INTEGRATION_TASKS.md): make it look like the pass-and-play Setup screen:
//   - show the 5 levels as cards (label, pigName, description) instead of radio buttons
//   - reuse ImageSlider so the player can pick their pig
//   - match the button styles from setup/Setup.jsx
//   - add a "Play Computer" button on Home.jsx linking to /live-game/vs-computer
export default function ComputerSetup() {
  const navigate = useNavigate();
  const { startGame, isBusy } = useGameSession();
  const { pigPetNames } = useGreedyPigContext();

  const [humanName, setHumanName] = useState("");
  const [level, setLevel] = useState(DEFAULT_LEVEL);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [humanGoesFirst, setHumanGoesFirst] = useState(true);

  async function handleStart(e) {
    e.preventDefault();
    const setupPlayers = buildVsComputerPlayers({
      humanName,
      humanPigIndex: 0,
      level,
      pigPetNames,
      humanGoesFirst,
    });
    const gameId = await startGame({ setupPlayers, winningTarget: target });
    if (gameId) navigate(`/live-game/game/${gameId}`);
  }

  return (
    <main>
      <Navbar />
      <form
        onSubmit={handleStart}
        className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-6 text-white"
      >
        <ErrorBanner />

        <label className="flex flex-col gap-1">
          Your name
          <input
            value={humanName}
            onChange={(e) => setHumanName(e.target.value)}
            placeholder={pigPetNames?.[0] ?? "Your name"}
            className="rounded-md border bg-[#ffffff20] p-2"
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2">Difficulty</legend>
          {DIFFICULTY_LEVELS.map((d) => (
            <label key={d.level} className="flex gap-2 rounded border border-[#ffffff40] p-2">
              <input
                type="radio"
                name="level"
                checked={level === d.level}
                onChange={() => setLevel(d.level)}
              />
              <span>
                <b>
                  {d.level}. {d.label}
                </b>{" "}
                ({d.pigName}): {d.description}
              </span>
            </label>
          ))}
        </fieldset>

        <label className="flex flex-col gap-1">
          Max score ({MIN_TARGET}–{MAX_TARGET})
          <input
            type="number"
            min={MIN_TARGET}
            max={MAX_TARGET}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-[250px] rounded-md border bg-[#ffffff20] p-2"
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={humanGoesFirst}
            onChange={(e) => setHumanGoesFirst(e.target.checked)}
          />
          I go first
        </label>

        <button
          type="submit"
          disabled={isBusy}
          className="rounded bg-[#D30CBD] px-16 py-4 text-xl font-bold disabled:opacity-50"
        >
          {isBusy ? "Creating game..." : "Play Computer"}
        </button>
      </form>
    </main>
  );
}
