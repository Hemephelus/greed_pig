/* eslint-disable react/prop-types */
import ComputerBadge from "src/computer/ui/ComputerBadge";
import StatusBadges from "src/components/powerups/StatusBadges";

function PlayerTable({ players }) {
  return (
    <table className="hidden md:table w-full">
          <thead>
            <tr className=" w-full h-[50px] bg-[#ffffff20] text-sm lg:text-base items-center  p-2 rounded-lg border border-[#FFFFFF40] hover:border-[#ffffff80] duration-300">
              <th className=" text-center text-white">Icons</th>
              <th className=" text-center text-white">Name</th>
              <th className=" text-center text-white">Total Score</th>
              <th className=" text-center text-white">Turn Score</th>
            </tr>
          </thead>

          <tbody>
            {players?.map((player, index) => (
              <tr
                key={player.id}
                id={index}
                className={`${
                  player.is_active ? "bg-[#ffffff40]" : ""
                } w-full text-base lg:text-xl p-2 rounded-lg bg-[#ffffff10] border border-[#FFFFFF40] hover:border-[#ffffff80] duration-300 scroll-mt-[300px] text-center  text-white `}
              >
                <td className="h-[70px] p-2 grid place-content-center">
                  <figure className="w-[50px] bg-[#ffffff20] p-2 border border-[#FFFF8F40] rounded">
                    <img src={player.avatar} alt={player.name} />
                  </figure>
                </td>
                <td className="">
                  {player.name}
                  <ComputerBadge player={player} />
                  <StatusBadges player={player} />
                </td>
                <td className="">
                  {player.total_score}
                </td>
                <td className="">
                  {player.turn_score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  )
}

export default PlayerTable