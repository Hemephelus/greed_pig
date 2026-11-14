import { useGameSession } from "src/context/GameSessionContext";
import ComputerBadge from "src/computer/ui/ComputerBadge";

function StatsSectionMobile() {
  const { leaderboard } = useGameSession();

  return (
    <section className="border-l-[#ffffff40] border-l sticky top-0 md:hidden grid grid-rows-[auto_auto_1fr] bg-[#00000010] text-[#F9F7E8] overflow-auto">
      <div className="bg-[#ffffff10] md:text-lg lg:text-xl xl:text-2xl font-extrabold border-y border-[#ffffff80] py-2 lg:py-4 text-center ">
        Leader Board
      </div>
      <div className=" overflow-y-auto p-2 bg-[#00000010]">
        <table className=" w-full">
          <tbody>
            {leaderboard?.map((player, index) => (
              <tr
                key={player.id}
                id={index}
                className={` ${
                  index === 0
                    ? `bg-[#FFD70010] text-[#FFEA70] border-[#FFD700c0] hover:border-[#FFD700]`
                    : index === leaderboard.length - 1
                    ? `bg-[#E71D3610] text-[#F17E8C] border-[#E71D36c0] hover:border-[#E71D36]`
                    : `bg-[#ffffff10] text-[#ffffff] border-[#ffffffc0] hover:border-[#ffffff]`
                } w-full h-[50px] rounded-lg border  duration-300 scroll-mt-[300px] text-base lg:text-lg`}
              >

                <td className=" text-center p-1">{index + 1}</td>
                <td className="w-[50px]">
                  <figure className={` h-[40px]  p-2 `}>
                    <img src={player.avatar} alt={player.name} />
                  </figure>
                </td>
                <td className=" ">
                  {" "}
                  {player.name}
                  <ComputerBadge player={player} />
                </td>
                <td className="  ">
                  {player.total_score}
                </td>
                <td className="  ">
                  {player.turn_score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default StatsSectionMobile;