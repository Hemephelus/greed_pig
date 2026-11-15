import ComputerBadge from "src/computer/ui/ComputerBadge";

function CurrentPlayerMobile({ activePlayer }) {
  if (!activePlayer) return null;

  return (
    <div className="md:hidden flex items-center justify-center text-sm w-full p-2">
      <table className=" w-full">
        <tbody>
          <tr
            className={` ${`bg-[#ffffff10] text-[#ffffff] border-[#ffffffc0] hover:border-[#ffffff]`} w-full h-[50px] rounded-lg border  duration-300 scroll-mt-[300px] text-base lg:text-lg`}
          >
            <td className="w-[50px]">
              <figure className={` h-[40px]  p-2 `}>
                <img src={activePlayer.avatar} alt={activePlayer.name} />
              </figure>
            </td>
            <td className=" ">
              {" "}
              {activePlayer.name}&apos;s Turn
              <ComputerBadge player={activePlayer} />
            </td>
            <td className="  ">{activePlayer.total_score}</td>
            <td className="  ">{activePlayer.turn_score}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default CurrentPlayerMobile;