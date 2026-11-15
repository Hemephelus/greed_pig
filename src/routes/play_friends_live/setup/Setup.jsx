import Navbar from "src/components/Navbar";
import { useLiveGameContext } from "src/context/useLiveGameContext";
import AddPlayerButton from "./components/AddPlayerButton";
import NameInput from "./components/NameInput";
import ImageSlider from "./components/ImageSlider";
import { useLocation, useNavigate } from "react-router-dom";
import { getInitialPlayerData } from "src/utils/live_game/getInitialData";
import SoundSwitch from "src/components/SoundSwitch";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ConvexError } from "convex/values";

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
    startGameLog,
    gameMode,
    setGameMode,
    setActiveMode,
    setGameId,
  } = useLiveGameContext();
  const navigate = useNavigate();
  const location = useLocation();
  const createGame = useMutation(api.games.createGame);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState("");
  const [showTutorialChoice, setShowTutorialChoice] = useState(false);
  const tutorialCompletionConsumed = useRef(false);
  const { preloadSrcList, pigPetNames } = useGreedyPigContext();
  const pigs = preloadSrcList.filter((pig) => pig.includes("pig"));

  const setupPlayers = useCallback(async (resume, modeOverride = null) => {
    setStartError("");
    if (resume) {
      navigate("/live-game/game");
      return;
    }

    const newPlayerData = playerData.map((player) => ({
      ...player,
      running_points: 0,
      total_points: 0,
    }));
    const modeToStart = modeOverride || gameMode;

    setIsStarting(true);
    try {
      if (modeToStart === "double_jeopardy") {
        // The server holds the real game; the browser only shows it.
        const id = await createGame({
          mode: "double_jeopardy",
          targetScore: Number(maxPoints),
          players: newPlayerData.map((player) => ({
            name: (player.name || player.tag).trim().slice(0, 30),
            avatar: player.avatar,
          })),
        });
        setGameId(id);
      } else {
        setGameId(null);
      }

      startGameLog({
        mode: modeToStart,
        targetScore: Number(maxPoints),
        players: newPlayerData.map((player, seat) => ({
          seat,
          name: (player.name || player.tag).slice(0, 30),
        })),
      });

      setActiveMode(modeToStart);
      setDiceValue(0);
      setIsGameOver(false);
      setCurrentPlayer(0);
      setPlayerData(newPlayerData);
      navigate("/live-game/game");
    } catch (error) {
      if (error instanceof ConvexError && typeof error.data === "string") {
        // A validation message we wrote ourselves, safe to show.
        setStartError(error.data);
      } else {
        setStartError(
          "Couldn't reach the game server. Check your connection and try again.",
        );
      }
    }
  }, [createGame, gameMode, maxPoints, navigate, playerData, setActiveMode, setCurrentPlayer, setDiceValue, setGameId, setIsGameOver, setPlayerData, startGameLog]);

  useEffect(() => {
    if (
      location.state?.startClassicAfterTutorial &&
      !tutorialCompletionConsumed.current
    ) {
      tutorialCompletionConsumed.current = true;
      // Clear the one-time marker before starting so a rerender or revisit cannot
      // initialize this game a second time.
      navigate(location.pathname, { replace: true, state: null });
      setGameMode("classic");
      void setupPlayers(false, "classic");
    }
  }, [location.pathname, location.state, navigate, setGameMode, setupPlayers]);

  function handleStartNewGame() {
    setStartError("");
    if (gameMode === "classic") {
      setShowTutorialChoice(true);
      return;
    }
    void setupPlayers(false);
  }

  function takeTutorial() {
    setShowTutorialChoice(false);
    navigate("/live-game/tutorial");
  }

  function skipTutorial() {
    setShowTutorialChoice(false);
    void setupPlayers(false);
  }

  function clearsPlayers() {
    setPlayerData(getInitialPlayerData(pigs, pigPetNames));
  }

  return (
    <>
      <main className="">
        <Navbar />
        <div className="flex flex-col items-center gap-8 text-white px-[5%] md:px-[10%] py-4 ">
          <section className="flex flex-col gap-2 w-full max-w-[520px]">
            <label>Game Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  value: "classic",
                  title: "Classic",
                  text: "One die. Roll a 1 and lose your turn points.",
                },
                {
                  value: "double_jeopardy",
                  title: "Double Jeopardy",
                  text: "Two dice. 1 + 3 saves your points. Any other 1 busts.",
                },
              ].map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  aria-pressed={gameMode === mode.value}
                  onClick={() => setGameMode(mode.value)}
                  className={`p-3 rounded-lg border text-left duration-300 ${
                    gameMode === mode.value
                      ? "bg-[#D30CBD40] border-[#D30CBD]"
                      : "bg-[#ffffff10] border-[#ffffff40] hover:border-[#ffffff80]"
                  }`}
                >
                  <p className="font-bold">{mode.title}</p>
                  <p className="text-xs opacity-80">{mode.text}</p>
                </button>
              ))}
            </div>
          </section>
          <section className="flex flex-col">
            <label htmlFor="">Max Score</label>
            <input
              type="number"
              min={25}
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
          <section className="flex gap-4 flex-wrap justify-center">
            {isContinue ? (
              <>
                <button
                  onClick={handleStartNewGame}
                  className="w-full md:w-fit sec-font text-xl rounded px-16 py-4 bg-[#D30CBD] font-bold  duration-500 skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc] "
                  disabled={isStarting}
                  label={isStarting ? "Starting..." : "Start New Game"}
                >
                  Start New Game
                </button>
                <button
                  onClick={() => {
                    setupPlayers(true);
                  }}
                  className="w-full md:w-fit sec-font text-xl rounded px-16 py-4 bg-[#D30CBD] font-bold  duration-500 -skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc] "
                  disabled={isStarting}
                >
                  Resume Game
                </button>
              </>
            ) : (
              <button
                onClick={handleStartNewGame}
                className=" sec-font text-xl rounded px-16 py-4 bg-[#D30CBD] font-bold  duration-500 skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc] "
                disabled={isStarting}
                label={isStarting ? "Starting..." : "Start Game"}
              >
                Start Game
              </button>
            )}
          </section>
          {startError && (
            <p role="alert" className="text-[#F17E8C] text-sm text-center">
              {startError}
            </p>
          )}
        </div>
        {showTutorialChoice && (
          <div className="fixed inset-0 z-30 grid place-items-center bg-[#000000c0] p-4" role="dialog" aria-modal="true" aria-labelledby="classic-tutorial-title">
            <section className="w-full max-w-lg rounded-xl border border-[#ffffff60] bg-[#111111] p-6 text-center text-white shadow-2xl">
              <h2 id="classic-tutorial-title" className="pri-font text-2xl sm:text-3xl">Learn How to Play first?</h2>
              <p className="my-4">Try a short guided game, or skip the tutorial and start your game now.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button type="button" onClick={takeTutorial} className="rounded-lg bg-[#D30CBD] px-6 py-3 font-bold hover:bg-[#d30cbc]">Take Tutorial</button>
                <button type="button" onClick={skipTutorial} className="rounded-lg border border-[#ffffff60] bg-[#ffffff10] px-6 py-3 font-bold hover:bg-[#ffffff20]">Skip Tutorial</button>
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}

export default LiveGameSetup;
