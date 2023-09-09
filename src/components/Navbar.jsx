import React from "react";
import logo from "../assets/hero-pig-img.png";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="sticky top-0 w-full flex justify-between py-2 px-4 md:px-8 md:py-4 text-white border-b border-b-[#ffffff80] items-center">
      <a href={`/`} className="flex lg:gap-2 items-center">
        <h1 className="pri-font text-lg sm:text-2xl lg:text-4xl ">
          Greedy Pig
        </h1>

        <img src={logo} alt="logo" width={75} />
      </a>
      <a
        href={`/how-to-play/`}
        className=" text-[#ffffff] hover:underline duration-300 font-bold hidden md:flex"
      >
        How To Play?
      </a>
      <Link
        to={`/how-to-play`}
        className=" text-[#ffffff] hover:underline duration-300 font-bold flex text-xl md:hidden"
      >
        ?
      </Link>
    </nav>
  );
}
