import Navbar from "src/components/Navbar";
import { useLiveGameContext } from "src/context/useLiveGameContext";
import AddPlayerButton from "./components/AddPlayerButton";
import NameInput from "./components/NameInput";
import ImageSlider from "./components/ImageSlider";
import { useNavigate } from "react-router-dom";
import { getInitialPlayerData } from "src/utils/live_game/getInitialData";
import SoundSwitch from "src/components/SoundSwitch";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import { useState } from "react";
import { api } from "src/utils/api";
import { applyServerGame } from "src/utils/live_game/serverGame";

const MIN_SCORE = 25;
const MAX_SCORE = 1000;

function LiveGameSetup() {
  const {
    playerData,
    maxPoints,
    setMaxPoints,
    setPlayerData,
    setDiceValue,
    setIsGameOver,
    setCurrentPlayer,
    isContinue,
    setGameId,
    setPendingShieldPlayer,
  } = useLiveGameContext();
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState("");
  const navigate = useNavigate();
  const { preloadSrcList, pigPetNames } = useGreedyPigContext();
  const pigs = preloadSrcList.filter((pig) => pig.includes("pig"));

  // Creates the game on the server, then opens the game screen
  async function startNewGame() {
    const points = Number(maxPoints);
    if (!Number.isInteger(points) || points < MIN_SCORE || points > MAX_SCORE) {
      setStartError(`Max score must be a whole number between ${MIN_SCORE} and ${MAX_SCORE}.`);
      return;
    }

    // Players who left their name empty use their pig's name
    const playerNames = playerData.map((player) => player.name.trim() || player.tag);

    setIsStarting(true);
    setStartError("");
    try {
      const game = await api.createLiveGame(playerNames, points);

      // Save the server ids on each player (matched by seat order)
      const { players, currentPlayer } = applyServerGame(playerData, game);
      setGameId(game.id);
      setPlayerData(players);
      setCurrentPlayer(currentPlayer);
      setMaxPoints(game.max_points);
      setDiceValue(0);
      setIsGameOver(false);
      setPendingShieldPlayer(null);
      navigate("/live-game/game");
    } catch (err) {
      setStartError(err.message);
    } finally {
      setIsStarting(false);
    }
  }

  // The game is still saved on the server, so just go back to it
  function resumeGame() {
    navigate("/live-game/game");
  }

  function clearsPlayers() {
    setPlayerData(getInitialPlayerData(pigs, pigPetNames));
  }

  return (
    <>
      <main className="">
        <Navbar />
        <div className="flex flex-col items-center gap-8 text-white px-[5%] md:px-[10%] py-4 ">
          <section className="flex flex-col">
            <label htmlFor="">Max Score</label>
            <input
              type="number"
              min={MIN_SCORE}
              max={MAX_SCORE}
              value={maxPoints}
              onChange={(e) => {
                setMaxPoints(e.target.value);
              }}
              className="p-2 bg-[#ffffff20] border rounded-md min-w-[5%] w-[250px]  "
              required
            />
          </section>
          <div className=" w-full  gap-2 flow-root">
            <section className="max-h-[350px] w-full overflow-y-auto bg-[#ffffff10] border rounded-lg p-4 grid grid-cols-fluid justify-center gap-4">
              {[...playerData].map((player, index) => (
                <div
                  key={player.id}
                  className=" flex flex-col w-full items-center  gap-2 p-2 rounded-lg border border-[#FFFFFF40] hover:border-[#ffffff80] duration-300"
                >
                  <NameInput player={player} index={index} />
                  <ImageSlider player={player} index={index} />
                </div>
              ))}

              <AddPlayerButton />
            </section>
            <button
              className="text-right text-xs p-2 bg-[#D30C0C40] text-[#ffffff] w-fit border border-[#D30C0C80] duration-300 hover:bg-[#D30C0C80]   hover:border-[#D30C0C] rounded float-right mt-2"
              onClick={clearsPlayers}
            >
              Clear Players
            </button>
            <SoundSwitch />
          </div>
          {startError && (
            <p role="alert" className="rounded-lg border border-red-400/50 bg-red-500/20 px-4 py-2 text-center text-sm text-red-100">
              {startError}
            </p>
          )}
          {isStarting && (
            <p aria-live="polite" className="text-center text-sm text-white/80">
              Creating your game... (the server can take up to a minute to wake up)
            </p>
          )}
          <section className="flex gap-4 flex-wrap justify-center">
            {isContinue ? (
              <>
                <button
                  onClick={startNewGame}
                  disabled={isStarting}
                  className="disabled:opacity-60 w-full md:w-fit sec-font text-xl rounded px-16 py-4 bg-[#D30CBD] font-bold  duration-500 skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc] "
                >
                  {isStarting ? "Starting..." : "Start New Game"}
                </button>
                <button
                  onClick={resumeGame}
                  disabled={isStarting}
                  className="disabled:opacity-60 w-full md:w-fit sec-font text-xl rounded px-16 py-4 bg-[#D30CBD] font-bold  duration-500 -skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc] "
                >
                  Resume Game
                </button>
              </>
            ) : (
              <button
                onClick={startNewGame}
                disabled={isStarting}
                className="disabled:opacity-60 sec-font text-xl rounded px-16 py-4 bg-[#D30CBD] font-bold  duration-500 skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc] "
              >
                {isStarting ? "Starting..." : "Start Game"}
              </button>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default LiveGameSetup;
