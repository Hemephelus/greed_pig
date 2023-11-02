import Navbar from "src/components/Navbar";
import { useLiveGameContext } from "src/context/useLiveGameContext";
import AddPlayerButton from "./components/AddPlayerButton";
import NameInput from "./components/NameInput";
import ImageSlider from "./components/ImageSlider";
import { Link } from "react-router-dom";

function LiveGameSetup() {
  const { playerData, maxPoints, setMaxPoints } = useLiveGameContext();

  return (
    <>
      <main className="">
        <Navbar />
        <div className="flex flex-col items-center gap-8 text-white px-[5%] md:px-[10%] py-4 ">
          <section className="flex flex-col">
            <label htmlFor="">Max Score</label>
            <input
              type="number"
              min={25}
              value={maxPoints}
              onChange={(e) => {setMaxPoints(e.target.value)}}
              className="p-2 bg-[#ffffff20] border rounded-md min-w-[5%] w-[250px]  "
              required
            />
          </section>  
          <section className="max-h-[400px] w-full overflow-y-auto bg-[#ffffff10] border rounded-lg p-4 grid grid-cols-fluid justify-center gap-4">
          
            {[...playerData].map((player,index) => (
              <div
                key={player.id}
                className=" flex flex-col w-full items-center  gap-2 p-2 rounded-lg border border-[#FFFFFF40] hover:border-[#ffffff80] duration-300">
                <NameInput player={player} index={index} />
                <ImageSlider player={player} index={index}/>
              </div>
            ))}

            <AddPlayerButton />
          </section>
          <section>
          <Link to={`/live-game/game`} className=" sec-font text-xl rounded px-16 py-4 bg-[#D30CBD] font-bold duration-300 ">Start Game</Link>
          </section>
        </div>
      </main>
    </>
  );
}

export default LiveGameSetup;
