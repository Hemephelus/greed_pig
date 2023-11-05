import { Outlet } from "react-router-dom";
import { GreedyPigContext } from "src/context/useGreedyPigContext";
import useImagePreloader from "src/hooks/useImagePreloader";
import pig0 from "src/assets/pig-0.png";
import pig1 from "src/assets/pig-1.png";
import pig2 from "src/assets/pig-2.png";
import pig3 from "src/assets/pig-3.png";
import pig4 from "src/assets/pig-4.png";
import pig5 from "src/assets/pig-5.png";
import pig6 from "src/assets/pig-6.png";
import pig7 from "src/assets/pig-7.png";
import pig8 from "src/assets/pig-8.png";
import pig9 from "src/assets/pig-9.png";
import pig10 from "src/assets/pig-10.png";
import pig11 from "src/assets/pig-11.png";
import pig12 from "src/assets/pig-12.png";
import pig13 from "src/assets/pig-13.png";
import pig14 from "src/assets/pig-14.png";
import pig15 from "src/assets/pig-15.png";
import pig16 from "src/assets/pig-16.png";
import pig17 from "src/assets/pig-17.png"
import pig18 from "src/assets/pig-18.png"
import pig19 from "src/assets/pig-19.png"
import pig20 from "src/assets/pig-20.png"
import pig21 from "src/assets/pig-21.png"
import pig22 from "src/assets/pig-22.png"
import pig23 from "src/assets/pig-23.png"
import pig24 from "src/assets/pig-24.png"
import pig25 from "src/assets/pig-25.png"
import pig26 from "src/assets/pig-26.png"
import pig27 from "src/assets/pig-27.png"
import pig28 from "src/assets/pig-28.png"
import dice1 from "src/assets/dice_1.png";
import dice2 from "src/assets/dice_2.png";
import dice3 from "src/assets/dice_3.png";
import dice4 from "src/assets/dice_4.png";
import dice5 from "src/assets/dice_5.png";
import dice6 from "src/assets/dice_6.png";
import { useState } from "react";
import { getPigPetNames } from "src/utils/getPigPetNames";

const preloadSrcList = [
  pig0,
  pig1,
  pig2,
  pig3,
  pig4,
  pig5,
  pig6,
  pig7,
  pig8,
  pig9,
  pig10,
  pig11,
  pig12,
  pig13,
  pig14,
  pig15,
  pig16,
  pig17,
  pig18,
  pig19,
  pig20,
  pig22,
  pig23,
  pig24,
  pig25,
  pig26,
  pig27,
  pig28,
  pig21,
  dice1,
  dice2,
  dice3,
  dice4,
  dice5,
  dice6,
];
const pigPetNames = getPigPetNames();


function Root() {
  const { imagesPreloaded } = useImagePreloader(preloadSrcList);
  const [hasSound, setHasSound] = useState(true);
  if (!imagesPreloaded) {
    return (
      <>
        <main className="bg-[#111111] min-h-screen min-w-full relative z-10 sec-font ">
          <div className=" rounded-full bg-[#056FA4] blur-[845px] w-[800px] h-[800px] -z-10 fixed -bottom-96 -left-96"></div>
          <div className=" rounded-full bg-[#D30CBD] blur-[845px] w-[800px] h-[800px] -z-10 fixed -top-96 -right-96"></div>
          Preloading Assets
        </main>
      </>
    );
  }

  return (
    <>
      <main className="bg-[#111111] min-h-screen min-w-full relative z-10 sec-font ">
        <div className=" rounded-full bg-[#056FA4] blur-[500px] md:blur-[845px] w-[800px] h-[800px] -z-10 fixed -bottom-[700px] -left-[700px] md:-bottom-96 md:-left-96"></div>
        <div className=" rounded-full bg-[#D30CBD] blur-[500px] md:blur-[845px] w-[800px] h-[800px] -z-10 fixed -top-[700px] -right-[700px] md:-top-96 md:-right-96"></div>
        <GreedyPigContext.Provider
          value={{ preloadSrcList, setHasSound, hasSound, pigPetNames }}
        >
          <Outlet />
        </GreedyPigContext.Provider>
      </main>
    </>
  );
}

export default Root;
