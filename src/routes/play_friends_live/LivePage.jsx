import { useState } from "react";
import { Outlet } from "react-router-dom";
import { LiveGameContext } from "src/context/useLiveGameContext";
import { getInitialPlayerData } from "src/utils/live_game/getInitialData";

function LiveGamePage() {
  const [playerData, setPlayerData] = useState(getInitialPlayerData());
  const [maxPoints, setMaxPoints] = useState(100);
  const [gameHistory, setGameHistory] = useState([]);
  const [numberRolled, setNumberRolled] = useState(0);
  const [isRolling, setIsRolling] = useState(false); //if the state of the game was still in the running points
  const [isGameOver, setIsGameOver] = useState(false); 
  const [isRunning, setIsRunning] = useState("?"); //if the state of the game was still in the running points
  const [diceValue, setDiceValue] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  return (
    <>
      <main className="bg-[#111111] min-h-screen min-w-full relative z-10 sec-font ">
        <div
          className={`${
            isRolling ? " bg-[#D30CBD] blur-[200px] md:blur-[300px] " : diceValue === 1 ? "bg-[#D30C0C]  blur-[500px] md:blur-[800px]" : "bg-[#056FA4]  blur-[500px] md:blur-[800px]"
          } rounded-full w-[800px] h-[800px] -z-10 fixed -bottom-[700px] -left-[700px] md:-bottom-96 md:-left-96 `}
        ></div>
        <div className={`${
            isRolling ? "bg-[#056FA4] blur-[200px] md:blur-[300px] " : diceValue === 1 ? "bg-[#D30C0C] blur-[500px] md:blur-[800px] " : "bg-[#D30CBD] blur-[500px] md:blur-[800px]"
          } rounded-full w-[800px] h-[800px]  -z-10 fixed -top-[700px] -right-[700px] md:-top-96 md:-right-96`}></div>
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
            isRolling,
            setIsRolling,
            diceValue,
            setDiceValue,
            currentPlayer,
            setCurrentPlayer,
            setIsGameOver,
            isGameOver
          }}
        >
          <Outlet />
        </LiveGameContext.Provider>
      </main>
    </>
  );
}

export default LiveGamePage;
