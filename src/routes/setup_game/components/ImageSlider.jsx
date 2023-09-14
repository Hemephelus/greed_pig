import React from "react";
// import logo from "../../assets/pig-0.png";
import logo from "../../../assets/pig-0.png";
// import pig1 from "../../assets/pig-1.png";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";

export default function ImageSlider() {
  return (
    <>
      {/* <img src={''} alt="logo" width={190} /> */}
      <div style={{backgroundImage:`${logo}`}} className="h-[100px] w-full duration-300" ></div>
      <section className="flex gap-2 w-full">
        <button className="w-[50%] p-2 flex justify-center bg-[#ffffff20] hover:bg-[#ffffff40] rounded border border-[#FFFFFF40] hover:border-[#ffffff80] duration-300">
          <IoIosArrowBack size={24} />
        </button>
        <button className="w-[50%] p-2  flex justify-center bg-[#ffffff20] hover:bg-[#ffffff40] rounded border border-[#FFFFFF40] hover:border-[#ffffff80] duration-300 ">
          <IoIosArrowForward size={24} />
        </button>
      </section>
    </>
  );
}
