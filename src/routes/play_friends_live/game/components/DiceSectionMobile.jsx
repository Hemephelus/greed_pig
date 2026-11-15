/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import { useLiveGameContext } from 'src/context/useLiveGameContext';
import { useGameSession, PHASE } from "src/context/GameSessionContext";
import Menu from "./Menu";
import { Dice } from "src/components/Dice";
import addPlayerSound from "src/sound_effect/add_player.mp3";
import useAudio from "src/hooks/useAudio";
import ComputerTurnLock from "src/computer/ui/ComputerTurnLock";
import PowerUpTray from "src/components/powerups/PowerUpTray";
import PowerUpFeedback from "src/components/powerups/PowerUpFeedback";

function DiceSectionMobile({ locked = false }) {
  const { setChangeBackground } = useLiveGameContext();
  const { bank, isBusy, phase, players, session } = useGameSession();
  const [isRolling, setIsRolling] = useState(false)
  const addPlayerAudio = useAudio(addPlayerSound);
    // Stops a fast second click from sending a second bank
  const bankInFlight = useRef(false);
  // Briefly locks the button after a bank, so a double-click can't also
  // bank for the next player
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
    <div className="relative border-r-[#ffffff40] border-r md:hidden flex flex-col items-center justify-around px-2 bg-[#00000010] min-h-[60vh] ">
         <button
          type="button"
          className="bg-[#056FA480] w-[200px] md:w-full  text-white text-center text-base lg:text-xl xl:text-2xl font-semibold py-2 lg:py-4 rounded border hover:scale-105 active:scale-100 duration-300 disabled:opacity-50 disabled:hover:scale-100"
          onClick={handlePassClick}
          disabled={isDisabled}
        >
          PASS
        </button>

          <Dice
          setIsRolling={setIsRolling}
          isRolling={isRolling}
          setChangeBackground={setChangeBackground}
          locked={locked}
        />
        <PowerUpTray locked={locked} variant="row" />
        <PowerUpFeedback />

        <Menu />
        <div className="text-white flex justify-between w-full">
          <p className="text-center text-sm lg:text-lg">{players.length} players</p>
          <p className="text-center text-sm  lg:text-lg">{session?.winning_target} max points</p>
        </div>
        <ComputerTurnLock locked={locked} />
      </div>
  )
}

export default DiceSectionMobile