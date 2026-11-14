import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import diceRollSound from "src/sound_effect/dice_roll.mp3";
import useAudio from "src/hooks/useAudio";

export function Dice({
  getFinalDiceValue,
  getRollValue,
  buttonClassName = "",
  disabled = false,
  setIsRolling,
  isRolling,
  setChangeBackground,
}) {
  const { preloadSrcList } = useGreedyPigContext();
  const [currentDice, setCurrentDice] = useState(0);
  const die = preloadSrcList.filter((dice) => dice.includes("dice"));
  const diceRollAudio = useAudio(diceRollSound);
  const callbacks = useRef({});
  callbacks.current = {
    getFinalDiceValue,
    getRollValue,
    setChangeBackground,
    setIsRolling,
    diceRollAudio,
  };

  const handleDiceClick = () => {
    setIsRolling(true);
    setChangeBackground(true);
  };

  useEffect(() => {
    if (isRolling) {
      let endRoll = 0;
      let interval, diceValue;
      interval = setInterval(() => {
        if (endRoll < 30) {
          callbacks.current.diceRollAudio?.play();
          diceValue = Math.floor(Math.random() * 6);
          setCurrentDice(diceValue);
          endRoll++;
        } else {
          clearInterval(interval);
          const finalValue = callbacks.current.getRollValue
            ? callbacks.current.getRollValue()
            : diceValue + 1;
          setCurrentDice(finalValue - 1);
          callbacks.current.getFinalDiceValue(finalValue);
          callbacks.current.setIsRolling(false);
          callbacks.current.setChangeBackground(false);
        }
      }, 100);
    }
  }, [isRolling]);

  return (
    <>
      <button
        aria-label="Roll the die"
        className={`hover:scale-105 active:scale-100 duration-300 md:w-auto w-[200px] ${buttonClassName}`}
        onClick={handleDiceClick}
        disabled={isRolling || disabled}
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

Dice.propTypes = {
  getFinalDiceValue: PropTypes.func.isRequired,
  getRollValue: PropTypes.func,
  buttonClassName: PropTypes.string,
  disabled: PropTypes.bool,
  setIsRolling: PropTypes.func.isRequired,
  isRolling: PropTypes.bool.isRequired,
  setChangeBackground: PropTypes.func.isRequired,
};
