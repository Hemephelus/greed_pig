import { Link } from "react-router-dom";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Navbar from "src/components/Navbar";

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-[#ffffff40] bg-[#ffffff10] p-4 text-center">
      <p className="pri-font text-3xl">{value}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
}

function formatDate(ms) {
  return new Date(ms).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function History() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const stats = useQuery(api.history.myStats, isAuthenticated ? {} : "skip");
  const games = useQuery(api.history.myGames, isAuthenticated ? {} : "skip");

  let body;
  if (isLoading || (isAuthenticated && (stats === undefined || games === undefined))) {
    body = <p className="text-center opacity-80">Loading your history...</p>;
  } else if (!isAuthenticated) {
    body = (
      <div className="text-center grid justify-items-center gap-4">
        <p>Sign in to see your match history.</p>
        <Link
          to="/sign-in?next=/history"
          className="sec-font rounded px-8 py-3 bg-[#d30cbcc0] font-bold hover:bg-[#d30cbc] duration-300"
        >
          Sign in / Sign up
        </Link>
      </div>
    );
  } else {
    body = (
      <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
          <StatCard label="Games played" value={stats.played} />
          <StatCard label="Wins" value={stats.wins} />
          <StatCard label="Win rate" value={`${stats.winRate}%`} />
          <StatCard label="Best score" value={stats.highestScore} />
        </div>

        {games.length === 0 ? (
          <div className="text-center grid justify-items-center gap-4 mt-6">
            <p className="opacity-80">No finished games yet.</p>
            <Link
              to="/"
              className="sec-font rounded px-8 py-3 bg-[#d30cbcc0] font-bold hover:bg-[#d30cbc] duration-300"
            >
              Play a game
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3 w-full mt-2">
            {games.map((g) => (
              <li
                key={g.roomId}
                className="rounded-lg border border-[#ffffff40] bg-[#ffffff10] p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded px-3 py-1 text-sm font-bold ${
                      g.won
                        ? "bg-[#4ade8030] text-[#bbf7d0]"
                        : "bg-[#E71D3630] text-[#F17E8C]"
                    }`}
                  >
                    {g.won ? "Win" : "Loss"}
                  </span>
                  <span className="text-sm opacity-80">
                    {formatDate(g.finishedAt)} · Room {g.code} · {g.maxPoints} max points
                  </span>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {g.players.map((p, i) => (
                    <li
                      key={i}
                      className={`rounded border px-3 py-1 text-sm ${
                        p.isWinner
                          ? "border-[#FFD700c0] bg-[#FFD70010] text-[#FFEA70]"
                          : "border-[#ffffff40]"
                      }`}
                    >
                      {p.name}
                      {p.isMe ? " (you)" : ""}: {p.score}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }

  return (
    <div className="text-white">
      <Navbar />
      <section className="max-w-3xl mx-auto flex flex-col items-center gap-4 p-4 md:p-8">
        <h2 className="pri-font text-3xl md:text-4xl">Match History</h2>
        {body}
      </section>
    </div>
  );
}