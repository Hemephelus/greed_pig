import { useRef, useState } from "react";
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
  const [activeMode, setActiveMode] = useState("classic");
  const [gameId, setGameId] = useState(null); // Convex game id (Double Jeopardy only)
  const gameLogRef = useRef(null);

  function startGameLog({ mode = "classic", targetScore, players }) {
    gameLogRef.current = createGameLog({
      clientGameId: generateId(),
      mode,
      targetScore: Number(targetScore),
      players,
    });
  }

  function logRoll(seat, dice, busted) {
    gameLogRef.current = addRollToGameLog(
      gameLogRef.current,
      seat,
      dice,
      busted,
    );
  }

  function logPass(seat, pointsBanked) {
    gameLogRef.current = closeGameLogTurn(
      gameLogRef.current,
      seat,
      "banked",
      pointsBanked,
    );
  }

  function finishGameLog(winnerSeat, winnerRunningPoints) {
    gameLogRef.current = finishLog(
      gameLogRef.current,
      winnerSeat,
      winnerRunningPoints,
    );
  }

  function getGameLog() {
    return gameLogRef.current;
  }

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
