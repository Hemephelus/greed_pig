/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { useLiveGameContext } from "src/context/useLiveGameContext";
import { useGameSession, PHASE } from "src/context/GameSessionContext";
import Menu from "./Menu";
import { Dice } from "src/components/Dice";
import addPlayerSound from "src/sound_effect/add_player.mp3";
import useAudio from "src/hooks/useAudio";
import ComputerTurnLock from "src/computer/ui/ComputerTurnLock";
import PowerUpTray from "src/components/powerups/PowerUpTray";
import PowerUpFeedback from "src/components/powerups/PowerUpFeedback";

function DiceSection({ locked = false }) {
  const { setChangeBackground } = useLiveGameContext();
  const { bank, isBusy, phase, players, session } = useGameSession();
  const [isRolling, setIsRolling] = useState(false);
  const addPlayerAudio = useAudio(addPlayerSound);

  // Stops a fast second click from sending a second bank
  const bankInFlight = useRef(false);

  const [justBanked, setJustBanked] = useState(false);
  const cooldown = useRef(null);
  useEffect(() => () => clearTimeout(cooldown.current), []);

  const handlePassClick = async () => {
    if (bankInFlight.current || isRolling || isBusy || locked) return;
    if (phase !== PHASE.PLAYING) return;

    bankInFlight.current = true;
    const res = await bank();
    bankInFlight.current = false;
    if (res) {
      addPlayerAudio?.play();
      setJustBanked(true);
      cooldown.current = setTimeout(() => setJustBanked(false), 700);
    }
  };

  const isDisabled =
    isRolling || isBusy || locked || justBanked || phase !== PHASE.PLAYING;

  return (
    <div className="h-screen border-r-[#ffffff40] border-r hidden md:flex flex-col items-center justify-around p-8 sticky top-0 bg-[#00000010] ">
            <Dice
        setIsRolling={setIsRolling}
        isRolling={isRolling}
        setChangeBackground={setChangeBackground}
        locked={locked}
      />
       <PowerUpTray locked={locked} />
      <PowerUpFeedback />
      
      <button
        type="button"
        className="bg-[#056FA4c0] w-full  text-white text-center text-base lg:text-xl xl:text-2xl font-semibold py-2 lg:py-4 rounded-lg border hover:scale-105 active:scale-100 duration-300 disabled:opacity-50 disabled:hover:scale-100"
        onClick={handlePassClick}
        disabled={isDisabled}
      >
        PASS
      </button>
      <div className="text-white grid place-content-center gap-2 bg-[#ffffff10] w-full p-4 rounded-lg border border-[#ffffff40]">
        <p className="text-center text-sm lg:text-lg">
          {players.length} players
        </p>
        <p className="text-center text-sm  lg:text-lg">
          {session?.winning_target} max points
        </p>
      </div>
      <Menu />
      <ComputerTurnLock locked={locked} />
    </div>
  );
}

export default DiceSection;