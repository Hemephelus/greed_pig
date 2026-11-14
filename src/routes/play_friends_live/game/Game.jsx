import { useEffect } from "react";
import Navbar from "src/components/Navbar";
import { useLiveGameContext } from "src/context/useLiveGameContext";
import PlayerTable from "./components/PlayerTable";
import StatsSection from "./components/StatsSection";
import GameOver from "./GameOver";
import DiceSection from "./components/DiceSection";
import StatsSectionMobile from "./components/StatsSectionMobile";
import CurrentPlayerMobile from "./components/CurrentPlayerMobile";
import DiceSectionMobile from "./components/DiceSectionMobile";
import DoubleJeopardyGame from "./DoubleJeopardyGame";

export default function LiveGame() {
  const { playerData, currentPlayer, isGameOver, setIsContinue, activeMode } =
    useLiveGameContext();

  useEffect(() => {
    setIsContinue(true);
  }, []);

  if (activeMode === "double_jeopardy") {
    return <DoubleJeopardyGame />;
  }

  return (
    <div className="md:grid md:grid-cols-[minmax(auto,_200px)_1fr_minmax(auto,_200px)] lg:grid-cols-[minmax(auto,_250px)_1fr_minmax(auto,_250px)] xl:grid-cols-[auto_1fr_minmax(auto,_300px)] relative">
      <DiceSection />
      <div className=" space-y-2 p-2">
        <Navbar />
        <PlayerTable playerData={playerData} currentPlayer={currentPlayer} />
      </div>
      <CurrentPlayerMobile
        playerData={playerData}
        currentPlayer={currentPlayer}
      />
      <DiceSectionMobile />

      <StatsSection playerData={playerData} currentPlayer={currentPlayer} />
      <StatsSectionMobile
        playerData={playerData}
        currentPlayer={currentPlayer}
      />
      {isGameOver ? (
        <GameOver
          playerData={playerData}
          currentPlayer={currentPlayer}
          setIsContinue={setIsContinue}
        />
      ) : (
        <></>
      )}
    </div>
  );
}
