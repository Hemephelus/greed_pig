import React from 'react'
import { useLiveGameContext } from 'src/context/useLiveGameContext';
import Menu from "./Menu";
import { Dice } from "src/components/Dice";
import addPlayerSound from "src/sound_effect/add_player.mp3";
import useAudio from "src/hooks/useAudio";


function DiceSection() {
  const {
    playerData,
    setPlayerData,
    setDiceValue,
    isRolling,
    setIsRolling,
    currentPlayer,
    setCurrentPlayer,
    maxPoints,
    setIsGameOver,
  } = useLiveGameContext();
  const addPlayerAudio = useAudio(addPlayerSound);

  const handlePassClick = () => {
    if (isRolling) return;
    addPlayerAudio?.play();
    let cp = currentPlayer;
    let newPlayerData = [...playerData];

    newPlayerData[cp]["total_points"] += newPlayerData[cp]["running_points"];
    newPlayerData[cp]["running_points"] = 0;
    setPlayerData(newPlayerData);

    cp = (currentPlayer + 1) % playerData.length;
    setCurrentPlayer(cp);
  };

  return (
    <div className="h-screen border-r-[#ffffff40] border-r hidden md:flex flex-col items-center justify-around p-8 sticky top-0 bg-[#00000010] ">
        <Dice
          getFinalDiceValue={setDiceValue}
          setIsRolling={setIsRolling}
          isRolling={isRolling}
          setCurrentPlayer={setCurrentPlayer}
          currentPlayer={currentPlayer}
          playerData={playerData}
          setPlayerData={setPlayerData}
          maxPoints={maxPoints}
          setIsGameOver={setIsGameOver}
        />
        <a
          href={"#" + (currentPlayer % playerData.length)}
          className="bg-[#056FA4c0] w-full  text-white text-center text-base lg:text-xl xl:text-2xl font-semibold py-2 lg:py-4 rounded-lg border hover:scale-105 active:scale-100 duration-300"
          onClick={handlePassClick}
        >
          PASS
        </a>
        <div className="text-white grid place-content-center gap-2 bg-[#ffffff10] w-full p-4 rounded-lg border border-[#ffffff40]">
          <p className="text-center text-sm lg:text-lg">{playerData.length} players</p>
          <p className="text-center text-sm  lg:text-lg">{maxPoints} max points</p>
        </div>
        <Menu />
      </div>
  )
}

export default DiceSection