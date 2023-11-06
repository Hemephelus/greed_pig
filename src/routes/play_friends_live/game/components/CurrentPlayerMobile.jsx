import React from "react";

function CurrentPlayerMobile({ playerData, currentPlayer }) {
  return (
    <div className="md:hidden flex items-center justify-center text-sm w-full p-2">
      <table className=" w-full">
        <tbody>
          <tr
            className={` ${`bg-[#ffffff10] text-[#ffffff] border-[#ffffffc0] hover:border-[#ffffff]`} w-full h-[50px] rounded-lg border  duration-300 scroll-mt-[300px] text-base lg:text-lg`}
          >
            <td className="w-[50px]">
              <figure className={` h-[40px]  p-2 `}>
                <img src={playerData[currentPlayer].avatar} />
              </figure>
            </td>
            <td className=" ">
              {" "}
              {playerData[currentPlayer].name === ""
                ? playerData[currentPlayer].tag
                : playerData[currentPlayer].name}
              's Turn
            </td>
            <td className="  ">
              {playerData[currentPlayer].total_points +
                playerData[currentPlayer].running_points}
            </td>
            <td className="  ">{playerData[currentPlayer].running_points}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default CurrentPlayerMobile;
