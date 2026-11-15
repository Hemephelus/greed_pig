/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";
import { useLiveGameContext } from "src/context/useLiveGameContext";
import { useGameSession, PHASE } from "src/context/GameSessionContext";
import { DIE_FACES } from "src/constants/game";
import diceRollSound from "src/sound_effect/dice_roll.mp3";
import loseSound from "src/sound_effect/lose_sound.mp3";
import useAudio from "src/hooks/useAudio";
import { registerDice } from "src/computer/ui/diceAnimator";
import Kbd from "src/components/Kbd";

const SHUFFLE_TICKS = 30;
const TICK_MS = 100;

export function Dice({
  setIsRolling,
  isRolling,
  setChangeBackground,
  locked = false,
}) {
  const { preloadSrcList } = useGreedyPigContext();
  const { setDiceValue } = useLiveGameContext();
  const { roll, isBusy, phase, message, lastRoll } = useGameSession();
  const [currentDice, setCurrentDice] = useState(0);
  const die = preloadSrcList.filter((dice) => dice.includes("dice"));
  const diceRollAudio = useAudio(diceRollSound);
  const loseAudio = useAudio(loseSound);

  const timer = useRef(null);
  // Stops a fast second click from sending a second roll
  const rollInFlight = useRef(false);
  const buttonRef = useRef(null);

  useEffect(() => () => clearInterval(timer.current), []);
  // Download and decode the bust sound now, so it starts the instant a 1 lands
  // instead of loading on its first play.
  useEffect(() => {
    if (loseAudio) {
      loseAudio.preload = "auto";
      loseAudio.load();
    }
  }, [loseAudio]);
  // Shows the server's answer once the request is done.
  // Returns the response (or null) so whoever started the roll gets it too.
  const finishRoll = async (request) => {
    const res = await request;
    rollInFlight.current = false;
    setIsRolling(false);
    setChangeBackground(false);
    // null = not allowed or the request failed (the error banner explains why)
    if (!res) return null;

    // The server picked the number. Math.random() is only used for the shuffle.
    const face = Array.isArray(res.dice) ? res.dice[0] : res.dice;
    setCurrentDice(face - 1);
    setDiceValue(face);
        if (res.bust && loseAudio) {
      // The file starts with ~0.1s of silence; skip it so the sound lands with the banner.
      loseAudio.currentTime = 0.1;
      loseAudio.play();
    }
    return res;
  };

  // The whole roll: shuffle with sound, THEN ask the server, then land on its number.
  // A human click and the computer both go through here, so they look identical.
  //   request: a function that asks the server, e.g. () => roll()
  // Resolves with the server's response, or null if the roll failed.
  const startRoll = (request) =>
    new Promise((resolve) => {
      rollInFlight.current = true;
      setIsRolling(true);
      setChangeBackground(true);

      let ticks = 0;
      timer.current = setInterval(() => {
        if (ticks < SHUFFLE_TICKS) {
          diceRollAudio?.play();
          setCurrentDice(Math.floor(Math.random() * DIE_FACES));
          ticks++;
                } else {
          clearInterval(timer.current);
          // The roll sound (3.6s) is longer than the shuffle (3.0s). Stop it when the
          // shuffle stops so no rattle is heard after the die has landed.
          if (diceRollAudio) {
            diceRollAudio.pause();
            diceRollAudio.currentTime = 0;
          }
          // Ask the server only once the shuffle is over, so the die and the
          // score both appear after the rolling stops.
          resolve(finishRoll(request()));
        }
      }, TICK_MS);
    });

  // The registered entry must always call the newest startRoll (it uses the
  // latest audio and state setters), so we keep it in a ref.
  const startRollRef = useRef(startRoll);
  useEffect(() => {
    startRollRef.current = startRoll;
  });

  // Let the computer use this die (see src/computer/ui/diceAnimator.js).
  // offsetParent is null when CSS hides the element (display: none), which is how
  // we tell the visible die from the hidden one.
  useEffect(
    () =>
      registerDice({
        isVisible: () => buttonRef.current?.offsetParent != null,
        run: (request) => startRollRef.current(request),
      }),
    []
  );

  // Keep the face in step with the server's latest roll. The die that is rolling
  // sets it itself; this keeps the other (hidden) die and any re-render correct.
  useEffect(() => {
    const face = Array.isArray(lastRoll?.dice) ? lastRoll.dice[0] : lastRoll?.dice;
    if (face && !rollInFlight.current) setCurrentDice(face - 1);
  }, [lastRoll]);

  const handleDiceClick = () => {
    if (rollInFlight.current || isRolling || isBusy || locked) return;
    if (phase !== PHASE.PLAYING) return;
    startRoll(() => roll());
  };

  const isDisabled = isRolling || isBusy || locked || phase !== PHASE.PLAYING;
  // Fade only when the die can't be used for a reason other than "rolling now"
  const isFaded = !isRolling && isDisabled;
  const isBust = Boolean(lastRoll?.bust);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        ref={buttonRef}
        data-shortcut="roll"
        title="Roll (R)"
        className={`relative hover:scale-105 active:scale-100 disabled:hover:scale-100 duration-300 md:w-auto w-[200px]
          ${
          isFaded ? "opacity-50" : ""
        }`}
        onClick={handleDiceClick}
        disabled={isDisabled}
      >
        {die.map((dice, index) => (
          <img
            key={index}
            src={dice}
            alt={currentDice + 1}
            className={`${currentDice === index ? "" : "hidden"}`}
          />
        ))}
        <Kbd className="absolute top-2 right-2 !bg-[#00000080]">R</Kbd>
      </button>
      <p
        className={`sec-font text-center text-sm lg:text-base min-h-[2.5rem] ${
          isBust ? "text-[#E71D36]" : "text-[#F9F7E8]"
        }`}
      >
        {!isRolling && message ? message : ""}
      </p>
    </div>
  );
}