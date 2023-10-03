import React, { useState } from "react";
import { usePlayerDataContext } from "../../../context/usePlayerDataContext";
import { IoMdAdd } from "react-icons/io";
import {
  generateId,
  getRandomIntegersBetween,
} from "../../../utils/generateData";

export default function AddPlayerButton() {
  const { setPlayerData, playerData } = usePlayerDataContext();
  const [isMax, setIsMax] = useState(false);

  function addPlayer() {
    const numberOfPlayers = Object.keys(playerData).length + 1;
    const newId = generateId();
    const index = getRandomIntegersBetween(0, 8)

    if (numberOfPlayers >= 10) {
      setIsMax(true);
    }

    let newPlayerData = { ...playerData };
    newPlayerData[newId] = {
      id: newId,
      avatar: `/src/assets/pig-${index}.png`,
      tag: `Player ${newId.split("-")[1]}`,
      name: "",
      pig_index: index,
      running_points: 0,
      total_points: 0,
      is_turn: true,
    };

    setPlayerData(newPlayerData);
  }

  return (
    <>
      {isMax ? (
        <button
          className=" text-white flex flex-col p-2 gap-1 items-center justify-center bg-[#ffffff20] hover:bg-[#ffffff40] rounded border border-[#FFFFFF40] hover:border-[#ffffff80] active:scale-95 duration-300 "
          disabled
        >
          You have reach the max amount of players
        </button>
      ) : (
        <button
          className=" text-white flex flex-col p-2 gap-1 items-center justify-center bg-[#ffffff20] hover:bg-[#ffffff40] rounded border border-[#FFFFFF40] hover:border-[#ffffff80] active:scale-95 duration-300 "
          onClick={addPlayer}
        >
          <IoMdAdd size={24} /> <span>Add Player</span>
        </button>
      )}
    </>
  );
}
