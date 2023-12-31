import React, { useRef, useState, useEffect } from "react";
import Confetti from "react-confetti";
import { Link } from "react-router-dom";

function GameOver({ playerData, currentPlayer, setIsContinue }) {
  const [leaderBoard, setLeaderBoard] = useState(playerData);
  const windowWidth = useRef(window.innerWidth);
  const windowHeight = useRef(window.innerHeight);

  useEffect(() => {
    setIsContinue(false)
  }, [])


  useEffect(() => {
    let newLeaderBoard = [...playerData].sort(
      (a, b) =>
        b.total_points + b.running_points - (a.total_points + a.running_points)
    );
    setLeaderBoard(newLeaderBoard);
  }, [playerData, currentPlayer]);
  return (
    <div className=" min-h-screen w-screen absolute bg-[#000000c0] flex justify-center items-center  text-white top-0">
      <Confetti width={windowWidth.current} height={windowHeight.current} />
      <section className="grid place-content-center gap-4 w-[400px]">
        <figure className="flex justify-center w-full">
          <img src={leaderBoard[0].avatar} alt="" width={300}/>
        </figure>
        <p className="text-center text-5xl pri-font capitalize">{leaderBoard[0].name === ''?leaderBoard[0].tag:leaderBoard[0].name} wins</p>

        <Link
          to={`/live-game/setup`}
          className="text-center sec-font text-xl rounded px-8 py-4 bg-[#d30cbcc0] font-bold duration-500 skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc]"
        >
          Play Again
        </Link>

        <Link
          to={`/`}
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
