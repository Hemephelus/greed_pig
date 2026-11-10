import React, { useState } from "react";
import logo from "../assets/pig-0.png";
import { Link, useNavigate } from "react-router-dom";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import AuthButton from "../components/AuthButton";

function cleanError(e) {
  const raw = typeof e?.data === "string" ? e.data : e?.message ?? "Something went wrong";
  return raw.replace(/^[\s\S]*Uncaught Error:\s*/, "").split("\n")[0];
}

const btn =
  " sec-font text-xl rounded px-8 py-4 bg-[#d30cbcc0] font-bold duration-500 hover:bg-[#d30cbc] hover:skew-x-0 hover:scale-95 ";

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const createRoom = useMutation(api.rooms.createRoom);
  const navigate = useNavigate();
  const [maxPoints, setMaxPoints] = useState(100);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleCreate() {
    setError("");
    setBusy(true);
    try {
      const result = await createRoom({ maxPoints: Number(maxPoints) });
      const code = typeof result === "string" ? result : result?.code;
      navigate(`/room/${code}`);
    } catch (e) {
      setError(cleanError(e));
    } finally {
      setBusy(false);
    }
  }

  function handleJoin(e) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) {
      setError("Room codes are 6 characters.");
      return;
    }
    navigate(`/room/${code}`);
  }

  return (
    <section className="relative w-full min-h-screen py-10 flex flex-col justify-center items-center">
      <div className="absolute top-4 right-4 md:top-6 md:right-8">
        <AuthButton />
      </div>

      <figure>
        <img src={logo} alt="" width={300} />
      </figure>
      <div className="flex flex-col gap-8 text-[#F9F7E8] text-center px-4">
        <h1 className="pri-font text-3xl sm:text-5xl lg:text-6xl ">
          Greedy Pig
        </h1>
        <div className="flex gap-4 flex-col items-center">
          <Link to={`/live-game/setup`} className={btn + "skew-x-6 w-full"}>
            Play Friends (Live)
          </Link>

          {isLoading ? null : !isAuthenticated ? (
            <Link to="/sign-in" className={btn + "-skew-x-6 w-full"}>
              Sign in to play online
            </Link>
          ) : (
            <div className="w-full rounded border border-[#ffffff40] bg-[#00000040] p-4 flex flex-col gap-4">
              <p className="pri-font text-xl">Online room</p>

              <div className="flex gap-2 items-center justify-center">
                <label htmlFor="maxPoints" className="text-sm">
                  Max score
                </label>
                <input
                  id="maxPoints"
                  type="number"
                  min={25}
                  max={500}
                  value={maxPoints}
                  onChange={(e) => setMaxPoints(e.target.value)}
                  className="w-24 rounded bg-[#ffffff20] border border-[#ffffff60] px-2 py-1 text-center"
                />
              </div>
              <button onClick={handleCreate} disabled={busy} className={btn + "-skew-x-6"}>
                {busy ? "Creating..." : "Create online room"}
              </button>

              <form onSubmit={handleJoin} className="flex gap-2">
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  placeholder="ROOM CODE"
                  aria-label="Room code"
                  className="flex-1 min-w-0 rounded bg-[#ffffff20] border border-[#ffffff60] px-3 py-2 text-center tracking-widest uppercase"
                />
                <button type="submit" className="rounded px-5 py-2 font-bold border border-[#ffffff80] hover:bg-[#ffffff20] duration-300">
                  Join
                </button>
              </form>

              {error ? (
                <p role="alert" className="text-sm text-[#ff9aa8]">
                  {error}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}