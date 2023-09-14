import React, { useEffect, useState } from "react";
import { usePlayerDataContext } from "../../../context/usePlayerDataContext";
import { IoMdMore } from "react-icons/io";

export default function NameInput({ player }) {
  const { setPlayerData, playerData } = usePlayerDataContext();
  const [isMin, setIsMin] = useState(false);

  useEffect(() => {
    const numberOfPlayers = Object.keys(playerData).length;
    if (numberOfPlayers < 3) {
      setIsMin(true);
      return;
    }
    setIsMin(false);
  }, [playerData]);

  function handleChange(e) {
    const name = e.target.value;
    let newPlayerData = { ...playerData };
    newPlayerData[player.id]["name"] = name;
    setPlayerData(newPlayerData);
  }

  function removePlayer() {
    let newPlayerData = { ...playerData };
    delete newPlayerData[player.id];
    setPlayerData(newPlayerData);
  }

  return (
    <div className="flex gap-1">
      <input
        type="text"
        value={player.name}
        onChange={handleChange}
        placeholder="Enter Name"
        className="text-lg font-medium text-center bg-transparent w-full p-0.5  border-b border-b-[#FFFFFF40]  "
      />
      <div className="group relative">
        <button
          className={`px-1 h-full flex justify-center items-center hover:bg-[#ffffff20] rounded border border-[#FFFFFF40] hover:border-[#ffffff80] duration-300`}
        >
          <IoMdMore size={24} />
        </button>

        <button
          className={`scale-0 group-hover:scale-100 delay-500 duration-300 text-red-500 bg-slate-50 mt-2 p-1 rounded font-medium absolute max-w-[150px]`}
          onClick={removePlayer}
          disabled={isMin}
        >
          {isMin ? "Min of 2 players required" : "Delete"}
        </button>
      </div>
    </div>
  );
}
