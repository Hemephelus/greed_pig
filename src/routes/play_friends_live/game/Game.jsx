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
import ShieldDecisionModal from "src/components/ShieldDecisionModal";

import useServerGameActions from "src/hooks/useServerGameActions";

export default function LiveGame() {
  const {
    playerData,
    currentPlayer,
    isGameOver,
    setIsContinue,
    pendingShieldPlayer,
  } = useLiveGameContext();

  // The shield decision is sent to the server, which ends the turn
  const { decideShield, isBusy, error } = useServerGameActions();

  useEffect(() => {
    setIsContinue(true)
  }, [])

  return (
    <div className="md:grid md:grid-cols-[minmax(auto,_200px)_1fr_minmax(auto,_200px)] lg:grid-cols-[minmax(auto,_250px)_1fr_minmax(auto,_250px)] xl:grid-cols-[auto_1fr_minmax(auto,_300px)] relative">
      <DiceSection />
      <div className=" space-y-2 p-2">
        <Navbar />
        <PlayerTable playerData={playerData} currentPlayer={currentPlayer} />
      </div>
      <CurrentPlayerMobile playerData={playerData} currentPlayer={currentPlayer}/>
      <DiceSectionMobile />

      <StatsSection playerData={playerData} currentPlayer={currentPlayer} />
      <StatsSectionMobile playerData={playerData} currentPlayer={currentPlayer} />
      {isGameOver ? (
        <GameOver playerData={playerData} currentPlayer={currentPlayer} setIsContinue={setIsContinue} />
      ) : (
        <></>
      )}
      {pendingShieldPlayer !== null && (
      <ShieldDecisionModal
        player={playerData[pendingShieldPlayer]}
        onUseShield={() => decideShield(true)}
        onDecline={() => decideShield(false)}
        isBusy={isBusy}
        error={error}
      />
      )}
    </div>
  );
}
