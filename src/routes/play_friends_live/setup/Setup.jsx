import Navbar from "src/components/Navbar";
import { useLiveGameContext } from "src/context/useLiveGameContext";
import AddPlayerButton from "./components/AddPlayerButton";
import NameInput from "./components/NameInput";
import ImageSlider from "./components/ImageSlider";
import { useNavigate } from "react-router-dom";
import { getInitialPlayerData } from "src/utils/live_game/getInitialData";
import SoundSwitch from "src/components/SoundSwitch";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";

function LiveGameSetup() {
  const {
    playerData,
    maxPoints,
    setMaxPoints,
    setPlayerData,
    setDiceValue,
    setIsGameOver,
    setCurrentPlayer,
    isContinue,
  } = useLiveGameContext();
  const navigate = useNavigate();
  const { preloadSrcList, pigPetNames } = useGreedyPigContext();
  const pigs = preloadSrcList.filter((pig) => pig.includes("pig"));

  function setupPlayers(resume) {
    if (!resume) {
      let newPlayerData = playerData.map((player) => {
        let newPlayer = {
          ...player,
          running_points: 0,
          total_points: 0,
        };
        return newPlayer;
      });

      setDiceValue(0);
      setIsGameOver(false);
      setCurrentPlayer(0);
      setPlayerData(newPlayerData);
    }
    navigate("/live-game/game");
  }

  function clearsPlayers() {
    setPlayerData(getInitialPlayerData(pigs, pigPetNames));
  }

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
              onChange={(e) => {
                setMaxPoints(e.target.value);
              }}
              className="p-2 bg-[#ffffff20] border rounded-md min-w-[5%] w-[250px]  "
              required
            />
          </section>
          <div className=" w-full  gap-2 flow-root">
            <section className="max-h-[350px] w-full overflow-y-auto bg-[#ffffff10] border rounded-lg p-4 grid grid-cols-fluid justify-center gap-4">
              {[...playerData].map((player, index) => (
                <div
                  key={player.id}
                  className=" flex flex-col w-full items-center  gap-2 p-2 rounded-lg border border-[#FFFFFF40] hover:border-[#ffffff80] duration-300"
                >
                  <NameInput player={player} index={index} />
                  <ImageSlider player={player} index={index} />
                </div>
              ))}

              <AddPlayerButton />
            </section>
            <button
              className="text-right text-xs p-2 bg-[#D30C0C40] text-[#ffffff] w-fit border border-[#D30C0C80] duration-300 hover:bg-[#D30C0C80]   hover:border-[#D30C0C] rounded float-right mt-2"
              onClick={clearsPlayers}
            >
              Clear Players
            </button>
            <SoundSwitch />
          </div>
          <section className="flex gap-4 flex-wrap">
            {isContinue ? (
              <>
                <button
                  onClick={() => {setupPlayers(false)}}
                  className=" sec-font text-xl rounded px-16 py-4 bg-[#D30CBD] font-bold  duration-500 skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc] "
                >
                  Start New Game
                </button>
                <button
                  onClick={() => {setupPlayers(true)}}
                  className=" sec-font text-xl rounded px-16 py-4 bg-[#D30CBD] font-bold  duration-500 skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc] "
                >
                  Resume Game
                </button>
              </>
            ) : (
              <button
                onClick={() => {setupPlayers(false)}}
                className=" sec-font text-xl rounded px-16 py-4 bg-[#D30CBD] font-bold  duration-500 skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc] "
              >
                Start Game
              </button>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default LiveGameSetup;
