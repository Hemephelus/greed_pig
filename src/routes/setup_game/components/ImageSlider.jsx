import React, { useState } from "react";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { usePlayerDataContext } from "../../../context/usePlayerDataContext";

export default function ImageSlider({ player }) {
  const { preloadSrcList, setPlayerData, playerData } = usePlayerDataContext();
  let pigs = preloadSrcList;
  const [slideIndex, setSlideIndex] = useState(0);
  const nextSlide = () => {
    if (slideIndex !== pigs.length - 1) {
      setSlideIndex(slideIndex + 1);
    } else if (slideIndex === pigs.length - 1) {
      setSlideIndex(0);
    }

    let newPlayerData = { ...playerData };
    newPlayerData[player.id]["avatar"] = pigs[slideIndex];
    setPlayerData(newPlayerData);
  };

  const prevSlide = () => {
    if (slideIndex !== 0) {
      setSlideIndex(slideIndex - 1);
    } else if (slideIndex === 0) {
      setSlideIndex(pigs.length - 1);
    }

    let newPlayerData = { ...playerData };
    newPlayerData[player.id]["avatar"] = pigs[slideIndex];
    setPlayerData(newPlayerData);
  };

  return (
    <>
      {pigs.map((pig, index) => {
        return (
          <div
            key={index}
            className={`${
              slideIndex === index ? " opacity-100" : "opacity-0 hidden "
            } w-full duration-500 h-[160px] flex justify-center items-center`}
          >
            <img src={playerData[player.id]["avatar"]} />
          </div>
        );
      })}
      <section className="flex gap-2 w-full">
        <BtnSlider moveSlide={prevSlide} direction={"prev"} />
        <BtnSlider moveSlide={nextSlide} direction={"next"} />
      </section>
    </>
  );
}

function BtnSlider({ direction, moveSlide }) {
  return (
    <button
      className="w-[50%] p-2  flex justify-center bg-[#ffffff20] hover:bg-[#ffffff40] rounded border border-[#FFFFFF40] hover:border-[#ffffff80] duration-300 "
      onClick={moveSlide}
    >
      {direction === "next" ? (
        <IoIosArrowForward size={24} />
      ) : (
        <IoIosArrowBack size={24} />
      )}
    </button>
  );
}
