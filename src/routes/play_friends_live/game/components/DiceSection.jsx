import { useState } from "react";
import { useLiveGameContext } from "src/context/useLiveGameContext";
import Menu from "./Menu";
import { Dice } from "src/components/Dice";
import addPlayerSound from "src/sound_effect/add_player.mp3";
import loseSound from "src/sound_effect/lose_sound.mp3";
import celebrationSound from "src/sound_effect/celebration.mp3";
import useAudio from "src/hooks/useAudio";
import LuckyShield from "src/components/LuckyShield";
import GameStatusMessage from "src/components/GameStatusMessage";
import useServerGameActions from "src/hooks/useServerGameActions";

function DiceSection() {
  const {
    playerData,
    setChangeBackground,
    currentPlayer,
    maxPoints,
    pendingShieldPlayer,
    isGameOver,
  } = useLiveGameContext();
  const [isRolling, setIsRolling] = useState(false);
  const { requestRoll, finishRoll, pass, isBusy, error } = useServerGameActions();
  const addPlayerAudio = useAudio(addPlayerSound);
  const loseAudio = useAudio(loseSound);
  const celebrationAudio = useAudio(celebrationSound);

  // Buttons are blocked while waiting for the server or for a shield decision
  const isLocked = isRolling || isBusy || pendingShieldPlayer !== null || isGameOver;

  async function handlePassClick(event) {
    event.preventDefault();
    if (isLocked) return;

    const result = await pass();
    if (result) addPlayerAudio?.play();
  }

  // Runs when the dice animation stops, with the value the server rolled
  function handleFinalDiceValue() {
    const result = finishRoll();
    if (!result) return;

    if (result.won) celebrationAudio?.play();
    else if (result.busted) loseAudio?.play();
  }

  return (
    <div className="h-screen border-r-[#ffffff40] border-r hidden md:flex flex-col items-center justify-around p-8 sticky top-0 bg-[#00000010] ">
      <Dice
        getFinalDiceValue={handleFinalDiceValue}
        requestRoll={requestRoll}
        setIsRolling={setIsRolling}
        isRolling={isRolling}
        disabled={isLocked}
        setChangeBackground={setChangeBackground}
      />
      <GameStatusMessage isRolling={isRolling} error={error} />
      <LuckyShield player={playerData[currentPlayer]} />
      <a
        href={"#" + (currentPlayer % playerData.length)}
        aria-disabled={isLocked}
        className={`bg-[#056FA4c0] w-full  text-white text-center text-base lg:text-xl xl:text-2xl font-semibold py-2 lg:py-4 rounded-lg border hover:scale-105 active:scale-100 duration-300 ${
          isLocked ? "opacity-60 pointer-events-none" : ""
        }`}
        onClick={handlePassClick}
      >
        {isBusy ? "SAVING..." : "PASS"}
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
