import { useEffect, useState } from "react";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import diceRollSound from "src/sound_effect/dice_roll.mp3";
import loseSound from "src/sound_effect/lose_sound.mp3";
import useAudio from "src/hooks/useAudio";

export function Dice({
  getFinalDiceValue,
  setIsRolling,
  isRolling,
  currentPlayer,
  setCurrentPlayer,
  playerData,
  setPlayerData,
}) {
  const { preloadSrcList } = useGreedyPigContext();
  const [currentDice, setCurrentDice] = useState(0);
  const dice = preloadSrcList.slice(8);
  const diceRollAudio = useAudio(diceRollSound);
  const loseAudio = useAudio(loseSound);

  const handleDiceClick = () => {
    // If successful, update the isCopied state value
    setIsRolling(true);
  };

  useEffect(() => {
    if (isRolling) {
      let endRoll = 0;
      let interval, r;

      interval = setInterval(() => {
        if (endRoll < 30) {
          diceRollAudio.play();
          r = Math.floor(Math.random() * 6);
          endRoll++;
          setCurrentDice(r);
        } else {
          let cp = currentPlayer;
          let newPlayerData = [...playerData];

          if (r === 0) {
            loseAudio.play();
            newPlayerData[cp]["running_points"] = r;
            cp = (currentPlayer + 1) % playerData.length;
            setCurrentPlayer(cp);
          } else {
            newPlayerData[cp]["running_points"] += r + 1;
            setPlayerData(newPlayerData);
          }

          clearInterval(interval);
          getFinalDiceValue(r + 1);
          setIsRolling(false);
        }
      }, 100);
    }
  }, [isRolling]);

  return (
    <>
      <button
        className={`hover:scale-105 active:scale-100 duration-300`}
        onClick={handleDiceClick}
        disabled={isRolling}
      >
        <img src={dice[currentDice]} alt={currentDice + 1} />
      </button>
    </>
  );
}