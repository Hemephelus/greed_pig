import React, { useState } from 'react'
import { useLiveGameContext } from 'src/context/useLiveGameContext';
import Menu from "./Menu";
import { Dice } from "src/components/Dice";
import addPlayerSound from "src/sound_effect/add_player.mp3";
import loseSound from "src/sound_effect/lose_sound.mp3";
import celebrationSound from "src/sound_effect/celebration.mp3";
import useAudio from "src/hooks/useAudio";


function DiceSectionMobile() {
  const {
    playerData,
    setPlayerData,
    setChangeBackground,
    currentPlayer,
    setCurrentPlayer,
    maxPoints,
    setIsGameOver,
    setDiceValue,
  } = useLiveGameContext();
  const [isRolling, setIsRolling] = useState(false)
  const addPlayerAudio = useAudio(addPlayerSound);
  const loseAudio = useAudio(loseSound);
  const celebrationAudio = useAudio(celebrationSound);

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

  function setGameOverPage(
    diceValue,
    playerData,
    currentPlayer,
    maxPoints,
    setIsGameOver,
    celebrationAudio
  ) {
    let currentPoint =
      playerData[currentPlayer].running_points +
      playerData[currentPlayer].total_points +
      diceValue;
    let interval
    let endRoll = 0
  
    if (currentPoint >= maxPoints) {
      interval = setInterval(() => {
        if (endRoll < 10) {
          endRoll++;
        } else {
          celebrationAudio?.play()
          setIsGameOver(true);
          clearInterval(interval);
        }
      }, 100);
    }
  }
  

  function handleFinalDiceValue(diceValue){
    let cp = currentPlayer;
    let newPlayerData = [...playerData];

    if (diceValue === 1) {
      loseAudio?.play();
      newPlayerData[cp]["running_points"] = 0;
      cp = (currentPlayer + 1) % playerData.length;
      setCurrentPlayer(cp);
      setDiceValue(diceValue)
    } else {
      setGameOverPage(
        diceValue,
        playerData,
        currentPlayer,
        maxPoints,
        setIsGameOver,
        celebrationAudio
      );
      newPlayerData[cp]["running_points"] += diceValue;
      setPlayerData(newPlayerData);
      setDiceValue(diceValue)
    }
  }

  return (
    <div className=" border-r-[#ffffff40] border-r md:hidden flex flex-col items-center justify-around px-2 bg-[#00000010] h-[60vh] ">
         <a
          href={"#" + (currentPlayer % playerData.length)}
          className="bg-[#056FA480] w-[200px] md:w-full  text-white text-center text-base lg:text-xl xl:text-2xl font-semibold py-2 lg:py-4 rounded border hover:scale-105 active:scale-100 duration-300"
          onClick={handlePassClick}
        >
          PASS
        </a>

        <Dice
          getFinalDiceValue={handleFinalDiceValue}
          setIsRolling={setIsRolling}
          isRolling={isRolling}
          setChangeBackground={setChangeBackground}
        />
      
      
        <Menu />
        <div className="text-white flex justify-between w-full">
          <p className="text-center text-sm lg:text-lg">{playerData.length} players</p>
          <p className="text-center text-sm  lg:text-lg">{maxPoints} max points</p>
        </div>
      </div>
  )
}

export default DiceSectionMobile