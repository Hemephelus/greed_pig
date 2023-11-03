import React from "react";
import { HiOutlineMenu } from "react-icons/hi";
import { BiUndo, BiRedo } from "react-icons/bi";
import { GoTools } from "react-icons/go";
import { Link } from "react-router-dom";
import SoundSwitch from "src/components/SoundSwitch";

function Menu() {
  return (
    <div className="group flex flex-col items-center gap-2 hover:cursor-pointer text-sm">
      <div className="flex  gap-2 group-hover:scale-100 scale-0 delay-300 duration-500 bg-[#D30CBD40] p-2 rounded-lg">
        {/* <div className="grid grid-cols-2 gap-2">
          <button
            className=" bg-[#ffffff20] hover:bg-[#ffffff40] text-white rounded-lg flex flex-col gap-2 p-2  justify-center items-center hover:scale-105 active:scale-100 duration-300"
            title="Undo"
          >
            {" "}
            <BiUndo size={24} /> Undo
          </button>
          <button
            className=" bg-[#ffffff20] hover:bg-[#ffffff40] text-white rounded-lg flex flex-col gap-2 p-2 justify-center items-center hover:scale-105 active:scale-100 duration-300"
            title="Redo"
          >
            {" "}
            <BiRedo size={24} /> Redo
          </button>
        </div> */}
        <div  className="grid grid-cols-2 gap-2">
          <Link
            to={`/live-game/setup`}
            className=" bg-[#ffffff20] hover:bg-[#ffffff40] text-white rounded-lg flex flex-col gap-2 p-2 justify-end items-center hover:scale-105 active:scale-100 duration-300"
            title="Setup"
          >
            {" "}
            <GoTools size={24} />
            Setup
          </Link>
          <div
            className=" bg-[#ffffff20] hover:bg-[#ffffff40] text-white rounded-lg flex flex-col gap-2 p-2 justify-end items-center hover:scale-105 active:scale-100 duration-300"
            title="Setup"
          >
           <SoundSwitch/> Sound
          </div>
        </div>
      </div>
      <button className="w-[48px] h-[48px] bg-[#D30CBD80] text-white rounded-full flex justify-center items-center">
        <HiOutlineMenu size={24} />
      </button>
    </div>
  );
}

export default Menu;
