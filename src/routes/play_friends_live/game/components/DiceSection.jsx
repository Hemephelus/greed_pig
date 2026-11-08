import React, { useState } from "react";
import { useLiveGameContext } from "src/context/useLiveGameContext";
import Menu from "./Menu";
import { Dice } from "src/components/Dice";
import useGameActions from "src/hooks/useGameActions";

function DiceSection() {
  const { playerData, setChangeBackground, currentPlayer, maxPoints } = useLiveGameContext();
  const [isRolling, setIsRolling] = useState(false);
  const { requestRoll, handleFinalDiceValue, handlePass, reportError } = useGameActions();

  return (
    <div className="h-screen border-r-[#ffffff40] border-r hidden md:flex flex-col items-center justify-around p-8 sticky top-0 bg-[#00000010] ">
      <Dice
        requestRoll={requestRoll}
        getFinalDiceValue={handleFinalDiceValue}
        onError={reportError}
        setIsRolling={setIsRolling}
        isRolling={isRolling}
        setChangeBackground={setChangeBackground}
      />
      <a
        href={"#" + (currentPlayer % playerData.length)}
        className="bg-[#056FA4c0] w-full  text-white text-center text-base lg:text-xl xl:text-2xl font-semibold py-2 lg:py-4 rounded-lg border hover:scale-105 active:scale-100 duration-300"
        onClick={() => handlePass(isRolling)}
      >
        PASS
      </a>
      <div className="text-white grid place-content-center gap-2 bg-[#ffffff10] w-full p-4 rounded-lg border border-[#ffffff40]">
        <p className="text-center text-sm lg:text-lg">
          {playerData.length} players
        </p>
        <p className="text-center text-sm  lg:text-lg">
          {maxPoints} max points
        </p>
      </div>
      <Menu />
    </div>
  );
}

export default DiceSection;
