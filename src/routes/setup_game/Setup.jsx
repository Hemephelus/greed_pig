import Navbar from "../../components/Navbar";
import logo from "../../assets/pig-0.png";
import pig1 from "../../assets/pig-1.png";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { usePlayerDataContext } from "../../context/usePlayerDataContext";
import AddPlayerButton from "./components/AddPlayerButton";
import NameInput from "./components/NameInput";
import ImageSlider from "./components/ImageSlider";

function Setup() {
  const { playerData } = usePlayerDataContext();

  return (
    <>
      <main className="">
        <Navbar />
        <div className="flex flex-col items-center gap-8 text-white px-[5%] md:px-[10%] ">
          <section className="flex flex-col">
            <label htmlFor="">Max Score</label>
            <input
              type="number"
              min={25}
              className="p-2 bg-[#ffffff20] border rounded-md "
              required
            />
          </section>
          <section className="max-h-[450px] w-full overflow-y-auto bg-[#ffffff10] border rounded-lg p-4 grid grid-cols-fluid justify-center gap-4">
            {Object.values(playerData)?.map((player) => (
              <div
                key={player.id}
                className=" flex flex-col w-full items-center  gap-2 p-2 rounded-lg border border-[#FFFFFF40] hover:border-[#ffffff80] duration-300"
              >
                <NameInput player={player} />

                <ImageSlider player={player}/>
              </div>
            ))}

            <AddPlayerButton />
          </section>
          <section></section>
        </div>
      </main>
    </>
  );
}

export default Setup;
