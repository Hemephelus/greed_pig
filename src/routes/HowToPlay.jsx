import React from "react";
import BackButton from "../components/BackButton";
import logo from "../assets/hero-pig-img.png";
import { AiFillHome } from "react-icons/ai";

export default function HowToPlay() {

  return (
    <div className="p-[5%] flex flex-col relative w-full items-center ">
      <nav className="fixed top-0 w-full flex justify-between p-[5%]">
        <BackButton />
        <a
          href={`/setup/`}
          className=" bg-[#D30CBD80] hover:bg-[#D30CBD] duration-300 text-white w-[48px] h-[48px] border rounded-full flex items-center justify-around"
        >
          <AiFillHome size={24} />
        </a>
      </nav>

      <div className="flex flex-col items-center gap-6 lg:gap-12 md:max-w-[70%] xl:max-w-[55%]">
        <figure className="">
          <img src={logo} alt="logo" width={400} />
        </figure>
        <section className="text-white space-y-4">
          <h1 className="pri-font text-2xl lg:text-4xl">GAME SETUP</h1>
          <section className=" backdrop:blur bg-[#ffffff10] px-8 lg:px-12 py-6 border text-base lg:text-xl rounded-lg">
            <ol className=" list-decimal">
              <li>Enter the max total point you want to reach. "First person to get to 100"</li>
              <li>Enter the number of players playing</li>
              <li>Enter the player names</li>
              <li>Next click on the "Play" button</li>
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
          Each turn, a player repeatedly rolls a die until either a <b>1</b> is rolled or the player decides to <b>"pass"</b>
          </p>
          </section>
          <section className=" backdrop:blur bg-[#ffffff10] px-8 lg:px-12 py-6 border text-base lg:text-xl rounded-lg flex flex-col items-center text-center">
          <h4 className=" text-lg lg:text-2xl font-bold">
            2.
          </h4>
          <p >
          If the player rolls a <b>1</b>, they score nothing and it becomes the next player's turn.
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
          The first player to score <b>100</b> or more points wins
          </p>
          </section>
        </section>
        <section className="text-white space-y-4">
          <h1 className="pri-font text-2xl lg:text-4xl">About the Devs</h1>
          <section className=" backdrop:blur bg-[#ffffff10] px-8 lg:px-12 py-6 border text-base lg:text-xl rounded-lg">
            <ul className=" list-disc space-y-4">
              <li>My name is Nwachuwku I am a front-end dev.</li>
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
