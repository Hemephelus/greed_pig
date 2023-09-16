import { Outlet } from "react-router-dom";
import { playerDataContext } from "../context/usePlayerDataContext";
import { getInitialPlayerData } from "../utils/getInitialData";
import { useState } from "react";
import useImagePreloader from "../hooks/useImagePreloader";
import pig0 from "../assets/pig-0.png";
import pig1 from "../assets/pig-1.png";
import pig2 from "../assets/pig-2.png";
import pig3 from "../assets/pig-3.png";
import pig4 from "../assets/pig-4.png";
import pig5 from "../assets/pig-5.png";
import pig6 from "../assets/pig-6.png";
import pig7 from "../assets/pig-7.png";

const preloadSrcList = [pig0, pig1, pig2, pig3, pig4, pig5, pig6, pig7];

function Root() {
  const [playerData, setPlayerData] = useState(getInitialPlayerData);
  const { imagesPreloaded } = useImagePreloader(preloadSrcList);
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
        <div className=" rounded-full bg-[#056FA4] blur-[845px] w-[800px] h-[800px] -z-10 fixed -bottom-96 -left-96"></div>
        <div className=" rounded-full bg-[#D30CBD] blur-[845px] w-[800px] h-[800px] -z-10 fixed -top-96 -right-96"></div>
        <playerDataContext.Provider value={{ playerData, setPlayerData, preloadSrcList }}>
          <Outlet />
        </playerDataContext.Provider>
      </main>
    </>
  );
}

export default Root;
