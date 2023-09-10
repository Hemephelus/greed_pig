import Navbar from "../components/Navbar";
import { useState } from "react";
import logo from "../assets/hero-pig-img.png";
function Setup() {
  let initialPlayers = [
    {
      id:'1',
      avatar:'',
      tag:'Player 1',
      name:''
    },
    {
      id:'2',
      avatar:'',
      tag:'Player 2',
      name:''
    },
    {
      id:'2',
      avatar:'',
      tag:'Player 2',
      name:''
    },
    {
      id:'2',
      avatar:'',
      tag:'Player 2',
      name:''
    },
  ]
  const [players, setPlayers] = useState(initialPlayers)
  return (
    <>
      <main className="">
        <Navbar />
        <div className="flex flex-col items-center gap-8 text-white px-[15%] ">
          <section className="flex flex-col">
            <label htmlFor="">Max Score</label>
            <input type="number" min={25} className="p-2 bg-[#ffffff20] border rounded-md " />
          </section>
          <section className="max-h-[400px] overflow-y-auto bg-[#ffffff10] border rounded-lg p-4 grid grid-cols-fluid">
              {
                players.map(player => (
                  <div key={player.id}>
                    <h4>{player.name}</h4>
                    <div className="flex gap-4">
                      <button>{'<'}</button>
                      <img src={logo} alt="" className="w-fit"/>
                      <button>{'>'}</button>
                    </div>
                    <input type="text" />
                  </div>
                ))
              }
          </section>
          <section></section>
        </div>
      </main>
    </>
  );
}

export default Setup;
