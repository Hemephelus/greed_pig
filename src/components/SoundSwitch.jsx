import React from "react";
import { AiOutlineSound, AiFillSound } from "react-icons/ai";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";

function SoundSwitch() {
  const { setHasSound, hasSound } = useGreedyPigContext();
  return (
    <button
      className="text-right text-xs  text-[#ffffff] mt-2 duration-300"
      onClick={() => {
        setHasSound(!hasSound);
      }}
    >
      {hasSound ? <AiFillSound size={24} /> : <AiOutlineSound size={24} />}
    </button>
  );
}

export default SoundSwitch;
