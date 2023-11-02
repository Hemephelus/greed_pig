import React from 'react'

function PlayerTable({playerData, currentPlayer}) {
  return (
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
                <td className="h-[70px] p-2 grid place-content-center">
                  <figure className="w-[50px] bg-[#ffffff20] p-2 border border-[#FFFF8F40] rounded">
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
  )
}

export default PlayerTable