import React, { useRef, useState, useEffect } from "react";
import Confetti from "react-confetti";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useLiveGameContext } from "src/context/useLiveGameContext";

function GameOver({ playerData, currentPlayer, setIsContinue }) {
  const [leaderBoard, setLeaderBoard] = useState(playerData);
  const windowWidth = useRef(window.innerWidth);
  const windowHeight = useRef(window.innerHeight);
  const gameLogFinished = useRef(false);
  const saveStarted = useRef(false);
  const saveGame = useMutation(api.stats.saveGame);
  const [saveStatus, setSaveStatus] = useState("saving");
  const [savedGameId, setSavedGameId] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const savedStats = useQuery(
    api.stats.getGameStats,
    showStats && savedGameId ? { gameId: savedGameId } : "skip",
  );
  const { finishGameLog, getGameLog } = useLiveGameContext();

  useEffect(() => {
    setIsContinue(false)
  }, [])

  useEffect(() => {
    if (gameLogFinished.current) return;
    gameLogFinished.current = true;
    const winner = [...playerData].sort(
      (a, b) => b.total_points + b.running_points - (a.total_points + a.running_points)
    )[0];
    const winnerSeat = playerData.findIndex((player) => player.id === winner.id);
    finishGameLog(winnerSeat, winner.running_points);
  }, [finishGameLog, playerData]);

  useEffect(() => {
    if (saveStarted.current) return;
    saveStarted.current = true;
    const gameLog = getGameLog();
    if (!gameLog) {
      setSaveStatus("error");
      return;
    }
    saveGame(gameLog)
      .then((gameId) => {
        setSavedGameId(gameId);
        setSaveStatus("saved");
      })
      .catch(() => setSaveStatus("error"));
  }, [getGameLog, retryCount, saveGame]);

  function retrySave() {
    saveStarted.current = false;
    setSaveStatus("saving");
    setRetryCount((count) => count + 1);
  }


  useEffect(() => {
    let newLeaderBoard = [...playerData].sort(
      (a, b) =>
        b.total_points + b.running_points - (a.total_points + a.running_points)
    );
    setLeaderBoard(newLeaderBoard);
  }, [playerData, currentPlayer]);
  return (
    <div className=" min-h-screen w-screen absolute bg-[#000000c0] flex justify-center items-center  text-white top-0">
      <Confetti width={windowWidth.current} height={windowHeight.current} />
      <section className="grid place-content-center gap-4 w-[400px]">
        <figure className="flex justify-center w-full">
          <img src={leaderBoard[0].avatar} alt="" width={300}/>
        </figure>
        <p className="text-center text-5xl pri-font capitalize">{leaderBoard[0].name === ''?leaderBoard[0].tag:leaderBoard[0].name} wins</p>

        <Link
          to={`/live-game/setup`}
          className="text-center sec-font text-xl rounded px-8 py-4 bg-[#d30cbcc0] font-bold duration-500 skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc]"
        >
          Play Again
        </Link>

        <Link
          to={`/`}
          className="text-center sec-font text-xl rounded px-8 py-4 bg-[#d30cbcc0] font-bold duration-500 -skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc]"
        >
          Home
        </Link>
        {saveStatus === "saved" ? (
          <button
            type="button"
            onClick={() => setShowStats(true)}
            className="text-center sec-font text-xl rounded px-8 py-4 bg-[#d30cbcc0] font-bold duration-500 skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc]"
          >
            View Stats
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="text-center sec-font text-xl rounded px-8 py-4 bg-[#d30cbcc0] font-bold duration-500 skew-x-6 opacity-60 cursor-not-allowed"
          >
            {saveStatus === "saving" ? "Saving stats..." : "View Stats"}
          </button>
        )}
        {saveStatus === "error" && (
          <div className="text-center text-sm">
            <p>Couldn&apos;t save your stats</p>
            <button type="button" onClick={retrySave} className="underline hover:text-[#d30cbc]">
              Retry
            </button>
          </div>
        )}
       <a href="https://forms.gle/skt5UKYGbDVzu2EL9" className="text-[#ffffff] underline text-center hover:text-[#d30cbc]" target="blank">feedback</a>
      </section>
      {showStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000d9] p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-stats-title"
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-[#D30CBD80] bg-[#111111] p-5 text-white shadow-[0_0_30px_#D30CBD30] sm:p-7"
          >
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-[#ffffff30] pb-4">
              <h2 id="game-stats-title" className="pri-font text-3xl text-[#D30CBD]">Game Stats</h2>
              <button type="button" onClick={() => setShowStats(false)} className="rounded border border-[#056FA480] bg-[#056FA420] px-4 py-2 sec-font hover:bg-[#056FA460]">
                Close
              </button>
            </div>
            {savedStats === undefined ? (
              <p role="status">Loading stats...</p>
            ) : savedStats === null ? (
              <p>Couldn&apos;t load your stats.</p>
            ) : (
              <>
                <div className="mb-5 grid gap-3 sm:grid-cols-2">
                  <p className="rounded-lg border border-[#D30CBD80] bg-[#D30CBD15] px-4 py-3">
                    Luckiest: {savedStats.players.find((player) => player.seat === savedStats.game.luckiestSeat)?.name ?? "—"}
                  </p>
                  <p className="rounded-lg border border-[#056FA480] bg-[#056FA415] px-4 py-3">
                    Risk Taker: {savedStats.players.find((player) => player.seat === savedStats.game.bestRiskTakerSeat)?.name ?? "—"}
                  </p>
                </div>
                <div className="space-y-3">
                  {savedStats.players.map((player) => (
                    <article key={player.seat} className="rounded-lg border border-[#ffffff40] bg-[#ffffff10] p-4">
                      <h3 className="mb-3 pri-font text-xl">{player.name} <span className="text-[#D30CBD]">- {player.finalScore} points</span></h3>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
                        <p className="rounded border border-[#ffffff20] bg-[#ffffff08] p-2">Successful turns<br /><strong className="text-[#D30CBD]">{player.successfulTurns}</strong></p>
                        <p className="rounded border border-[#ffffff20] bg-[#ffffff08] p-2">Busts<br /><strong className="text-[#056FA4]">{player.busts}</strong></p>
                        <p className="rounded border border-[#ffffff20] bg-[#ffffff08] p-2">Rolls<br /><strong>{player.totalRolls}</strong></p>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default GameOver;
