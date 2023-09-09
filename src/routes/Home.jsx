import React from "react";
import logo from "../assets/hero-pig-img.png";

export default function Home() {
  return (
    <section className=" w-full h-screen flex flex-col justify-center items-center">
      <figure>
        <img src={logo} alt="" width={400} />
      </figure>
      <div className="flex flex-col gap-8 text-[#F9F7E8] text-center">

      <h1 className="pri-font text-3xl sm:text-5xl lg:text-6xl ">Greedy Pig</h1>
      <div>
      <a href={`/setup/`} className=" sec-font text-xl rounded px-16 py-4 bg-[#D30CBD] font-bold duration-300 ">Play</a>
      </div>
      <a href={`/how-to-play/`} className=" sec-font underline font-semibold ">How to play</a>
      </div>
    </section>
  );
}
