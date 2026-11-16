import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import { LiveGameContext } from "src/context/useLiveGameContext";
import { getInitialPlayerData } from "src/utils/live_game/getInitialData";
import { generateId } from "src/utils/generateData";
import {
  addRollToGameLog,
  closeGameLogTurn,
  createGameLog,
  finishGameLog as finishLog,
} from "src/utils/live_game/gameLog";

const SAVED_GAME_KEY = "greedyPig.doubleJeopardyGame";

const SAVED_LOG_KEY = "greedyPig.doubleJeopardyLog";

function loadSavedLog() {
  try {
    const log = JSON.parse(localStorage.getItem(SAVED_LOG_KEY));
    return log && log.mode === "double_jeopardy" ? log : null;
  } catch {
    return null;
  }
}
// Read the saved game, but only trust it if it belongs to this Convex deployment.
function loadSavedGame() {
  try {
    const raw = localStorage.getItem(SAVED_GAME_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (
      saved.mode === "double_jeopardy" &&
      typeof saved.gameId === "string" &&
      saved.deployment === import.meta.env.VITE_CONVEX_URL
    ) {
      return saved;
    }
  } catch {
    // Storage can be blocked or corrupted; start fresh.
  }
  return null;
}

function LiveGamePage() {
  const { preloadSrcList, pigPetNames } = useGreedyPigContext();
  const [playerData, setPlayerData] = useState(
    getInitialPlayerData(preloadSrcList.slice(0, 9), pigPetNames),
  );
  const [maxPoints, setMaxPoints] = useState(100);
  const [gameHistory, setGameHistory] = useState([]);
  const [numberRolled, setNumberRolled] = useState(0);
  const [changeBackground, setChangeBackground] = useState(false); //if the state of the game was still in the running points
  const [isGameOver, setIsGameOver] = useState(false);
  const [isContinue, setIsContinue] = useState(false);
  const [isRunning, setIsRunning] = useState("?"); //if the state of the game was still in the running points
  const [diceValue, setDiceValue] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [gameMode, setGameMode] = useState("classic"); // "classic" | "double_jeopardy"
  const [savedGame] = useState(loadSavedGame);
  const [activeMode, setActiveMode] = useState(
    savedGame ? "double_jeopardy" : "classic",
  );
  const [gameId, setGameId] = useState(savedGame ? savedGame.gameId : null);
  const [initialLog] = useState(() => (savedGame ? loadSavedLog() : null));
  const gameLogRef = useRef(initialLog);

  function updateGameLog(nextLog) {
    gameLogRef.current = nextLog;
    try {
      localStorage.setItem(SAVED_LOG_KEY, JSON.stringify(nextLog));
    } catch {
      // Ignore storage errors; the log just won't survive a refresh.
    }
  }

  function startGameLog({ mode = "classic", targetScore, players }) {
    updateGameLog(
      createGameLog({
        clientGameId: generateId(),
        mode,
        targetScore: Number(targetScore),
        players,
      }),
    );
  }

  function logRoll(seat, dice, busted) {
    updateGameLog(addRollToGameLog(gameLogRef.current, seat, dice, busted));
  }

  function logPass(seat, pointsBanked) {
    updateGameLog(
      closeGameLogTurn(gameLogRef.current, seat, "banked", pointsBanked),
    );
  }

  function finishGameLog(winnerSeat, winnerRunningPoints) {
    updateGameLog(
      finishLog(gameLogRef.current, winnerSeat, winnerRunningPoints),
    );
  }

  function getGameLog() {
    return gameLogRef.current;
  }

  useEffect(() => {
    try {
      if (activeMode === "double_jeopardy" && gameId) {
        localStorage.setItem(
          SAVED_GAME_KEY,
          JSON.stringify({
            mode: "double_jeopardy",
            gameId,
            deployment: import.meta.env.VITE_CONVEX_URL,
          }),
        );
      } else {
        localStorage.removeItem(SAVED_GAME_KEY);
      }
    } catch {
      // Ignore storage errors; the game still works without refresh support.
    }
  }, [activeMode, gameId]);

  return (
    <>
      <main className="bg-[#111111] min-h-screen min-w-full relative z-10 sec-font ">
        <div
          className={`${
            changeBackground
              ? " bg-[#D30CBD] blur-[200px] md:blur-[300px] "
              : diceValue === 1
                ? "bg-[#D30C0C]  blur-[500px] md:blur-[800px]"
                : "bg-[#056FA4]  blur-[500px] md:blur-[800px]"
          } rounded-full w-[800px] h-[800px] -z-10 fixed -bottom-[700px] -left-[700px] md:-bottom-96 md:-left-96 `}
        ></div>
        <div
          className={`${
            changeBackground
              ? "bg-[#056FA4] blur-[200px] md:blur-[300px] "
              : diceValue === 1
                ? "bg-[#D30C0C] blur-[500px] md:blur-[800px] "
                : "bg-[#D30CBD] blur-[500px] md:blur-[800px]"
          } rounded-full w-[800px] h-[800px]  -z-10 fixed -top-[700px] -right-[700px] md:-top-96 md:-right-96`}
        ></div>
        <LiveGameContext.Provider
          value={{
            playerData,
            setPlayerData,
            maxPoints,
            setMaxPoints,
            gameHistory,
            setGameHistory,
            numberRolled,
            setNumberRolled,
            isRunning,
            setIsRunning,
            changeBackground,
            setChangeBackground,
            diceValue,
            setDiceValue,
            currentPlayer,
            setCurrentPlayer,
            setIsGameOver,
            isGameOver,
            isContinue,
            setIsContinue,
            startGameLog,
            logRoll,
            logPass,
            finishGameLog,
            getGameLog,
            gameMode,
            setGameMode,
            activeMode,
            setActiveMode,
            gameId,
            setGameId,
          }}
        >
          <Outlet />
        </LiveGameContext.Provider>
      </main>
    </>
  );
}

export default LiveGamePage;
