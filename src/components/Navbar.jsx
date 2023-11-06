import React from "react";
import logo from "../assets/pig-0.png";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="sticky top-0 w-full flex justify-between py-2 px-4 md:px-[2%] md:py-[2%] text-white border-b border-b-[#ffffff80] backdrop-blur items-center">
      <a href={`/`} className="flex lg:gap-2 items-center">
        <h1 className="pri-font text-base sm:text-lg md:text-xl lg:text-2xl xl:text-4xl ">
          Greedy Pig
        </h1>

        <img src={logo} alt="logo" width={75} />
      </a>
      <Link
        to={`/live-game/how-to-play`}
        className=" text-[#ffffff] hover:underline duration-300 font-bold hidden md:flex"
      >
        How To Play?
      </Link>
      <Link
        to={`/live-game/how-to-play`}
        className=" text-[#ffffff] hover:underline duration-300 font-bold flex text-xl md:hidden"
      >
        ?
      </Link>
    </nav>
  );
}
