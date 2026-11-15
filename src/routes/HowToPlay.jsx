import React from "react";
import logo from "src/assets/pig-0.png";
import { AiFillHome } from "react-icons/ai";
import { Link } from "react-router-dom";
import BackButton from "src/components/BackButton";
import { DIFFICULTY_LEVELS } from "src/computer/difficulty";
import {
  MIN_PLAYERS,
  MAX_PLAYERS,
  MIN_TARGET,
  MAX_TARGET,
  DEFAULT_TARGET,
} from "src/constants/game";

export default function HowToPlay() {

  return (
    <div className="p-[5%] flex flex-col relative w-full items-center ">
      <nav className="fixed top-0 w-full flex justify-between p-[5%]">
        <BackButton />
        <Link
          to={`/live-game/setup`}
          className=" bg-[#D30CBD80] hover:bg-[#D30CBD] duration-300 text-white w-[48px] h-[48px] border rounded-full flex items-center justify-around"
        >
          <AiFillHome size={24} />
        </Link>
      </nav>

      <div className="flex flex-col items-center gap-6 lg:gap-12 md:max-w-[70%] xl:max-w-[55%]">
        <figure className="">
          <img src={logo} alt="logo" width={400} />
        </figure>
        <section className="text-white space-y-4">
          <h1 className="pri-font text-2xl lg:text-4xl">GAME SETUP</h1>
          <section className=" backdrop:blur bg-[#ffffff10] px-8 lg:px-12 py-6 border text-base lg:text-xl rounded-lg">
            <ol className=" list-decimal">
              <li>Enter the max score you want to reach ({MIN_TARGET} to {MAX_TARGET}, default {DEFAULT_TARGET}). "First person to get to {DEFAULT_TARGET}"</li>
              <li>Enter the number of players ({MIN_PLAYERS} to {MAX_PLAYERS})</li>
              <li>Enter the player names. Leave a name empty and a pig pet name is used</li>
              <li>Next click on the "Start Game" button</li>
            </ol>
          </section>
        </section>
  
        <section className="text-white space-y-4">
          <h1 className="pri-font text-2xl lg:text-4xl">GREEDY PIG RULES </h1>
          <section className=" backdrop:blur bg-[#ffffff10] px-8 lg:px-12 py-6 border text-base lg:text-xl rounded-lg flex flex-col items-center text-center">
          <h4 className=" text-lg lg:text-2xl font-bold">
            1.
          </h4>
          <p >
          Each turn, a player repeatedly rolls <b>one die</b> until either a <b>1</b> is rolled or the player decides to <b>"pass"</b>.
          </p>
          </section>
          <section className=" backdrop:blur bg-[#ffffff10] px-8 lg:px-12 py-6 border text-base lg:text-xl rounded-lg flex flex-col items-center text-center">
          <h4 className=" text-lg lg:text-2xl font-bold">
            2.
          </h4>
          <p >
          If the player rolls a <b>1</b>, it is a bust: they score nothing for that turn and it becomes the next player's turn.
          </p>
          </section>
          <section className=" backdrop:blur bg-[#ffffff10] px-8 lg:px-12 py-6 border text-base lg:text-xl rounded-lg flex flex-col items-center text-center">
          <h4 className=" text-lg lg:text-2xl font-bold">
            3.
          </h4>
          <p >
          If the player rolls any other number, it is added to their turn total and the player's turn continues.
          </p>
          </section>
          <section className=" backdrop:blur bg-[#ffffff10] px-8 lg:px-12 py-6 border text-base lg:text-xl rounded-lg flex flex-col items-center text-center">
          <h4 className=" text-lg lg:text-2xl font-bold">
            4.
          </h4>
          <p >
          <b>Pass</b> adds the turn total to their total score, and the turn goes to the next player.
          </p>
          </section>
          <section className=" backdrop:blur bg-[#ffffff10] px-8 lg:px-12 py-6 border text-base lg:text-xl rounded-lg flex flex-col items-center text-center">
          <h4 className=" text-lg lg:text-2xl font-bold">
            5.
          </h4>
          <p >
          The first player to <b>pass</b> and reach the max score (default <b>{DEFAULT_TARGET}</b>) or more wins.
          </p>
          </section>
        </section>

        <section className="text-white space-y-4">
          <h1 className="pri-font text-2xl lg:text-4xl">PLAY VS COMPUTER</h1>
          <section className=" backdrop:blur bg-[#ffffff10] px-8 lg:px-12 py-6 border text-base lg:text-xl rounded-lg">
            <p className="mb-4">
              From the home page, pick <b>Play Computer</b>, choose a level, and the computer takes its turns by itself. The server still rolls the die, so it is fair.
            </p>
            <ul className="space-y-3">
              {DIFFICULTY_LEVELS.map((d) => (
                <li
                  key={d.level}
                  className="border border-[#ffffff40] bg-[#ffffff10] rounded-lg p-3"
                >
                  <b className="text-[#FFD700]">Level {d.level}: {d.label}</b>{" "}
                  <span className="text-[#F17E8C]">({d.pigName})</span>
                  <br />
                  {d.description}
                </li>
              ))}
            </ul>
          </section>
        </section>

        <section className="text-white space-y-4">
          <h1 className="pri-font text-2xl lg:text-4xl">About the Devs</h1>
          <section className=" backdrop:blur bg-[#ffffff10] px-8 lg:px-12 py-6 border text-base lg:text-xl rounded-lg">
            <ul className=" list-disc space-y-4">
              <li>My name is Nwachukwu I am a front-end dev.</li>
              <li>This is my <a href="https://sites.google.com/view/nwachukwuujubuonu/home" target="blanks" className=" underline text-[#D30CBD] font-bold">portfolio site</a> if you you like to see some of my other works.</li>
              <li>This project was built with React and Vite</li>
              <li>I didn't work alone. This project was designed by <b>Oluwatomisin Rhema Eghosa Odukoya</b> and <b>Alozie Blessed  Chuebuka</b>. </li>
            </ul>
          </section>
        </section>
      </div>
    </div>
  );
}