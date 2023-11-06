import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import { LiveGameContext } from "src/context/useLiveGameContext";
import { getInitialPlayerData } from "src/utils/live_game/getInitialData";

function LiveGamePage() {
  const { preloadSrcList,pigPetNames } = useGreedyPigContext();
  const [playerData, setPlayerData] = useState(getInitialPlayerData(preloadSrcList.slice(0,9),pigPetNames));
  const [maxPoints, setMaxPoints] = useState(100);
  const [gameHistory, setGameHistory] = useState([]);
  const [numberRolled, setNumberRolled] = useState(0);
  const [changeBackground, setChangeBackground] = useState(false); //if the state of the game was still in the running points
  const [isGameOver, setIsGameOver] = useState(false); 
  const [isContinue, setIsContinue] = useState(false); 
  const [isRunning, setIsRunning] = useState("?"); //if the state of the game was still in the running points
  const [diceValue, setDiceValue] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  
  return (
    <>
      <main className="bg-[#111111] min-h-screen min-w-full relative z-10 sec-font ">
        <div
          className={`${
            changeBackground ? " bg-[#D30CBD] blur-[200px] md:blur-[300px] " : diceValue === 1 ? "bg-[#D30C0C]  blur-[500px] md:blur-[800px]" : "bg-[#056FA4]  blur-[500px] md:blur-[800px]"
          } rounded-full w-[800px] h-[800px] -z-10 fixed -bottom-[700px] -left-[700px] md:-bottom-96 md:-left-96 `}
        ></div>
        <div className={`${
            changeBackground ? "bg-[#056FA4] blur-[200px] md:blur-[300px] " : diceValue === 1 ? "bg-[#D30C0C] blur-[500px] md:blur-[800px] " : "bg-[#D30CBD] blur-[500px] md:blur-[800px]"
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
            changeBackground,
            setChangeBackground,
            diceValue,
            setDiceValue,
            currentPlayer,
            setCurrentPlayer,
            setIsGameOver,
            isGameOver,
            isContinue,
            setIsContinue
          }}
        >
          <Outlet />
        </LiveGameContext.Provider>
      </main>
    </>
  );
}

export default LiveGamePage;
