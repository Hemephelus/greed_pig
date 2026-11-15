import { useEffect, useRef, useState } from "react";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import diceRollSound from "src/sound_effect/dice_roll.mp3";
import useAudio from "src/hooks/useAudio";

// requestRoll (optional): asks the server for the roll and returns its dice value.
// Without it, the dice picks a random value in the browser like before.
export function Dice({
  getFinalDiceValue,
  setIsRolling,
  isRolling,
  setChangeBackground,
  requestRoll,
  disabled = false,
}) {
  const { preloadSrcList } = useGreedyPigContext();
  const [currentDice, setCurrentDice] = useState(0);
  const die = preloadSrcList.filter((dice) => dice.includes("dice"));
  const diceRollAudio = useAudio(diceRollSound);

  // The server's answer, which arrives while the animation is playing
  const serverRoll = useRef(null);

  const handleDiceClick = () => {
    if (requestRoll) serverRoll.current = requestRoll();
    setIsRolling(true);
    setChangeBackground(true);
  };

  useEffect(() => {
    if (isRolling) {
      let endRoll = 0;
      let interval, diceValue;
      interval = setInterval(async () => {
        if (endRoll < 30) {
          diceRollAudio?.play();
          diceValue = Math.floor(Math.random() * 6);
          setCurrentDice(diceValue);
          endRoll++;
        } else {
          clearInterval(interval);

          if (serverRoll.current) {
            // Wait for the server, then show the value it rolled
            const serverValue = await serverRoll.current;
            serverRoll.current = null;
            if (serverValue) {
              setCurrentDice(serverValue - 1);
              getFinalDiceValue(serverValue);
            }
          } else {
            getFinalDiceValue(diceValue + 1);
          }

          setIsRolling(false);
          setChangeBackground(false);
        }
      }, 100);
    }
  }, [isRolling]);

  return (
    <>
      <button
        className={`hover:scale-105 active:scale-100 duration-300 md:w-auto w-[200px] disabled:opacity-60 disabled:hover:scale-100`}
        onClick={handleDiceClick}
        disabled={isRolling || disabled}
        aria-label="Roll the dice"
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
