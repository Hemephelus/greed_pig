import React, { useState } from "react";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { useLiveGameContext } from "src/context/useLiveGameContext";
import selectSound from 'src/sound_effect/selection_button.mp3'
import useAudio from "src/hooks/useAudio";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";

export default function ImageSlider({ player, index }) {
  const { setPlayerData, playerData } = useLiveGameContext();
  const { preloadSrcList } = useGreedyPigContext();
  let pigs = preloadSrcList.slice(0,9);
  const [slideIndex, setSlideIndex] = useState(player.pig_index);

  const nextSlide = () => {
    let  newSlideIndex
    if (slideIndex !== pigs.length - 1) {
      newSlideIndex =  slideIndex + 1
      setSlideIndex(newSlideIndex);
    } else if (slideIndex === pigs.length - 1) {
      newSlideIndex = 0
      setSlideIndex(newSlideIndex);
    }

    let newPlayerData = [ ...playerData ];
    newPlayerData[index]["avatar"] = pigs[newSlideIndex];
    newPlayerData[index]["pig_index"] = newSlideIndex;
    setPlayerData(newPlayerData);
  };

  const prevSlide = () => {
   let  newSlideIndex
    if (slideIndex !== 0) {
      newSlideIndex = slideIndex - 1
      setSlideIndex(newSlideIndex);
    } else if (slideIndex === 0) {
      newSlideIndex = pigs.length - 1
      setSlideIndex(newSlideIndex);
    }

    let newPlayerData = [ ...playerData ];
    newPlayerData[index]["avatar"] = pigs[newSlideIndex];
    newPlayerData[index]["pig_index"] = newSlideIndex;
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
           
            <img src={pig} />
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
    const audio = useAudio(selectSound)
  return (
    <button
      className="w-[50%] p-2  flex justify-center bg-[#ffffff20] hover:bg-[#ffffff40] rounded border border-[#FFFFFF40] hover:border-[#ffffff80] active:scale-90 duration-[100ms] "
      onClick={() => {audio.play(),moveSlide()}}

    >
      {direction === "next" ? (
        <IoIosArrowForward size={24} />
      ) : (
        <IoIosArrowBack size={24} />
      )}
    </button>
  );
}
