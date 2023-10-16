import React from "react";
import { usePlayerDataContext } from "../../../context/usePlayerDataContext";
import { IoMdAdd } from "react-icons/io";
import {
  generateId,
  getRandomIntegersBetween,
} from "../../../utils/generateData";
import selectSound from "../../../sound_effect/add_player.mp3";
import useAudio from "../../../hooks/useAudio";

export default function AddPlayerButton() {
  const MAX_NUMBER_OF_PLAYERS = 10
  const { setPlayerData, playerData } = usePlayerDataContext();
  const audio = useAudio(selectSound);

  function addPlayer() {
    audio.play()
    const newId = generateId();
    const index = getRandomIntegersBetween(0, 8);

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

  function isMax() {
   return (Object.keys(playerData).length) >= MAX_NUMBER_OF_PLAYERS
  }

  return (
    <>
      {isMax() ? (
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
