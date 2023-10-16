import React from "react";
import { usePlayerDataContext } from "../../../context/usePlayerDataContext";
import { IoMdAdd } from "react-icons/io";
import {
  generateId,
  getRandomIntegersBetween,
} from "../../../utils/generateData";
import addPlayerSound from "../../../sound_effect/add_player.mp3";
import invalidSound from "../../../sound_effect/invalid.mp3";
import useAudio from "../../../hooks/useAudio";

export default function AddPlayerButton() {
  const MAX_NUMBER_OF_PLAYERS = 10
  const { setPlayerData, playerData } = usePlayerDataContext();
  const invalidAudio = useAudio(invalidSound);
  const addPlayerAudio = useAudio(addPlayerSound);

  function addPlayer() {
    addPlayerAudio.play()
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
          className=" text-white flex flex-col p-2 gap-1 items-center justify-center bg-[#f93e3e20] hover:bg-[#f93e3e40] rounded border border-[#f93e3e40] hover:border-[#f93e3e80] active:-translate-x-3 duration-200 cursor-not-allowed"
          onClick={() => {invalidAudio.play()}}
        >
          You have reach the max amount of players
        </button>
      ) : (
        <button
          className=" text-white flex flex-col p-2 gap-1 items-center justify-center bg-[#ffffff20] hover:bg-[#ffffff40] rounded border border-[#FFFFFF40] hover:border-[#ffffff80] active:scale-95 duration-[350ms] "
          onClick={addPlayer}
        >
          <IoMdAdd size={24} /> <span>Add Player</span>
        </button>
      )}
    </>
  );
}
