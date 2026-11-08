import { useEffect, useState } from "react";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import diceRollSound from "src/sound_effect/dice_roll.mp3";
import useAudio from "src/hooks/useAudio";

export function Dice({
  requestRoll,
  getFinalDiceValue,
  onError,
  setIsRolling,
  isRolling,
  setChangeBackground,
}) {
  const { preloadSrcList } = useGreedyPigContext();
  const [currentDice, setCurrentDice] = useState(0);
  const die = preloadSrcList.filter((dice) => dice.includes("dice"));
  const diceRollAudio = useAudio(diceRollSound);

  const handleDiceClick = () => {
    setIsRolling(true);
    setChangeBackground(true);
  };

  useEffect(() => {
    if (!isRolling) return;

    let ticks = 0;
    // Ask the server for the real roll straight away. The spinning faces below
    // are only for show; the number that counts is the one the server returns.
    const serverRoll = requestRoll().then(
      (result) => ({ result }),
      (error) => ({ error })
    );

    const interval = setInterval(async () => {
      if (ticks < 30) {
        diceRollAudio?.play();
        setCurrentDice(Math.floor(Math.random() * 6));
        ticks++;
        return;
      }

      clearInterval(interval);
      const { result, error } = await serverRoll;
      if (error) {
        onError(error.message);
      } else {
        setCurrentDice(result.roll - 1);
        getFinalDiceValue(result);
      }
      setIsRolling(false);
      setChangeBackground(false);
    }, 100);

    return () => clearInterval(interval);
  }, [isRolling]);

  return (
    <>
      <button
        className={`hover:scale-105 active:scale-100 duration-300 md:w-auto w-[200px]`}
        onClick={handleDiceClick}
        disabled={isRolling}
      >
        {die.map((dice, index) => (
          <img
            key={index}
            src={dice}
            alt={currentDice + 1}
            className={`${currentDice === index ? "" : "hidden"}`}
          />
        ))}
      </button>
    </>
  );
}
