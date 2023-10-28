import React, { useEffect, useState } from "react";
import { Dice } from "src/components/Dice";
import Navbar from "src/components/Navbar";
import { useLiveGameContext } from "src/context/useLiveGameContext";
import Menu from "../Menu";
import addPlayerSound from "src/sound_effect/add_player.mp3";
import useAudio from "src/hooks/useAudio";

export default function LiveGame() {
  const {
    playerData,
    setPlayerData,
    setDiceValue,
    isRolling,
    setIsRolling,
    currentPlayer,
    setCurrentPlayer,
  } = useLiveGameContext();
  const addPlayerAudio = useAudio(addPlayerSound);

  const handlePassClick = () => {
    // If successful, update the isCopied state value
    addPlayerAudio.play();
    let cp = currentPlayer % playerData.length;
    let newPlayerData = [...playerData];

    newPlayerData[cp]["total_points"] += newPlayerData[cp]["running_points"];
    newPlayerData[cp]["running_points"] = 0;
    setPlayerData(newPlayerData);

    setCurrentPlayer(currentPlayer + 1);
  };

  return (
    <div className="grid grid-cols-[auto_1fr_minmax(auto,_350px)]">
      <div className="h-screen border-r-[#ffffff40] border-r flex flex-col items-center justify-around p-8 sticky top-0  ">
        <Dice
          getFinalDiceValue={setDiceValue}
          setIsRolling={setIsRolling}
          isRolling={isRolling}
          setCurrentPlayer={setCurrentPlayer}
          currentPlayer={currentPlayer}
          playerData={playerData}
          setPlayerData={setPlayerData}
        />
        <a
          href={"#" + (currentPlayer) % playerData.length}
          className="bg-[#056FA4c0] w-full  text-white text-center text-2xl font-semibold py-4 rounded-lg border hover:scale-105 active:scale-100 duration-300"
          onClick={handlePassClick}
        >
          PASS
        </a>
        <Menu />
      </div>
      <div className=" space-y-2 p-2">
        <Navbar />
        <table className="w-full">
          <thead>
            <tr className=" w-full h-[50px] bg-[#ffffff20] items-center  p-2 rounded-lg border border-[#FFFFFF40] hover:border-[#ffffff80] duration-300">
              <th className=" text-center text-white">Icons</th>
              <th className=" text-center text-white">Name</th>
              <th className=" text-center text-white">Total Points</th>
              <th className=" text-center text-white">Running Points</th>
            </tr>
          </thead>

          <tbody>
            {Object.values(playerData)?.map((player, index) => (
              <tr
                key={player.id}
                id={index}
                className={`${
                  index === currentPlayer % playerData.length
                    ? "bg-[#ffffff40]"
                    : ""
                } w-full p-2 rounded-lg bg-[#ffffff10] border border-[#FFFFFF40] hover:border-[#ffffff80] duration-300 scroll-mt-[300px] `}
              >
                <td className="h-[100px] p-2 grid place-content-center">
                  <figure className="w-[70px] bg-[#ffffff20] p-2 border border-[#FFFF8F40] rounded">
                    <img src={player.avatar} alt={player.tag} />
                  </figure>
                </td>
                <td className=" text-center text-2xl text-white">
                  {player.name}
                </td>
                <td className=" text-center text-2xl text-white">
                  {player.total_points + player.running_points}
                </td>
                <td className=" text-center text-2xl text-white">
                  {player.running_points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="h-screen border-l-[#ffffff40] border-l sticky top-0">
        {" "}
        hi
      </div>
    </div>
  );
}
