import { useEffect, useRef } from "react";
import Confetti from "react-confetti";
import { Link } from "react-router-dom";
import { useGameSession } from "src/context/GameSessionContext";
import celebrationSound from "src/sound_effect/celebration.mp3";
import useAudio from "src/hooks/useAudio";
import { useVsComputerResult } from "src/computer/ui/useVsComputerResult";

function GameOver({ setIsContinue }) {
  const { winner, leaderboard, resetGame } = useGameSession();
  const windowWidth = useRef(window.innerWidth);
  const windowHeight = useRef(window.innerHeight);
  const celebrationAudio = useAudio(celebrationSound);
  const hasPlayed = useRef(false);

  // After a refresh the bank response is gone, so fall back to the top of the
  // leaderboard, which the server also ranks by banked score.
  const champion = winner ?? leaderboard[0];
  // Only set when a computer was playing; null keeps the pass-and-play wording
  const vsComputer = useVsComputerResult(champion);
  // No party when the computer beats you
  const celebrate = vsComputer?.celebrate ?? true;

  useEffect(() => {
    setIsContinue(false)
  }, [])

  // Once per win, not on every re-render
  useEffect(() => {
    if (hasPlayed.current || !celebrate) return;
    hasPlayed.current = true;
    celebrationAudio?.play();
  }, [celebrationAudio, celebrate]);

  if (!champion) return null;

  return (
    <div className=" min-h-screen w-screen absolute bg-[#000000c0] flex justify-center items-center  text-white top-0">
      {celebrate ? (
        <Confetti width={windowWidth.current} height={windowHeight.current} />
      ) : null}
      <section className="grid place-content-center gap-4 w-[400px]">
        <figure className="flex justify-center w-full">
          <img src={champion.avatar} alt="" width={300}/>
        </figure>
        <p className="text-center text-5xl pri-font capitalize">{champion.name} wins</p>
        {vsComputer ? (
          <p className="text-center sec-font text-xl text-[#FFEA70]">{vsComputer.subline}</p>
        ) : null}

        <Link
          to={vsComputer?.playAgainPath ?? `/live-game/setup`}
          onClick={resetGame}
          className="text-center sec-font text-xl rounded px-8 py-4 bg-[#d30cbcc0] font-bold duration-500 skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc]"
        >
          {vsComputer?.playAgainLabel ?? "Play Again"}
        </Link>

        <Link
          to={`/`}
          onClick={resetGame}
          className="text-center sec-font text-xl rounded px-8 py-4 bg-[#d30cbcc0] font-bold duration-500 -skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc]"
        >
          Home
        </Link>
       <a href="https://forms.gle/skt5UKYGbDVzu2EL9" className="text-[#ffffff] underline text-center hover:text-[#d30cbc]" target="blank">feedback</a>
      </section>
    </div>
  );
}

export default GameOver;