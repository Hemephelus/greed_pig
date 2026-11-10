import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Navbar from "src/components/Navbar";
import cleanError from "src/utils/cleanError";
import { useRoomImages, nameOf } from "./roomHooks";

export default function Lobby({ room, myUserId }) {
    const startGame = useMutation(api.rooms.startGame);
    const { avatarFor } = useRoomImages();
    const [error, setError] = useState("");
    const [copied, setCopied] = useState("");
    const [busy, setBusy] = useState(false);
    const isHost = room.hostId === myUserId;

    async function copy(text, label) {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(label);
            setTimeout(() => setCopied(""), 1500);
        } catch {
            /* clipboard not available */
        }
    }

    async function handleStart() {
        setError("");
        setBusy(true);
        try {
            await startGame({ code: room.code });
        } catch (e) {
            setError(cleanError(e));
        } finally {
            setBusy(false);
        }
    }

    return (
        <div>
            <Navbar />
            <section className="text-white flex flex-col items-center gap-6 p-4 md:p-8">
                <div className="text-center">
                    <p className="text-sm opacity-80">Room code</p>
                    <p className="pri-font text-5xl md:text-6xl tracking-widest">
                        {room.code}
                    </p>
                    <div className="flex gap-2 justify-center mt-3">
                        <button
                            onClick={() => copy(room.code, "code")}
                            className="rounded px-4 py-2 text-sm font-bold border border-[#ffffff80] hover:bg-[#ffffff20] duration-300"
                        >
                            {copied === "code" ? "Copied!" : "Copy code"}
                        </button>
                        <button
                            onClick={() =>
                                copy(`${window.location.origin}/room/${room.code}`, "link")
                            }
                            className="rounded px-4 py-2 text-sm font-bold border border-[#ffffff80] hover:bg-[#ffffff20] duration-300"
                        >
                            {copied === "link" ? "Copied!" : "Copy link"}
                        </button>
                    </div>
                </div>

                <p className="text-sm lg:text-lg">
                    {room.players.length} / 6 players · {room.maxPoints} max points
                </p>

                <ul className="w-full max-w-md flex flex-col gap-2">
                    {room.players.map((p) => (
                        <li
                            key={p._id}
                            className="flex items-center gap-3 rounded-lg border border-[#FFFFFF40] bg-[#ffffff10] p-2"
                        >
                            <figure className="w-[50px] bg-[#ffffff20] p-2 border border-[#FFFF8F40] rounded">
                                <img src={avatarFor(p.seat)} alt="" />
                            </figure>
                            <span className="text-lg flex-1">
                                {nameOf(p)}
                                {p.userId === myUserId ? " (you)" : ""}
                            </span>
                            {p.userId === room.hostId ? (
                                <span className="text-xs rounded px-2 py-1 bg-[#FFD70030] text-[#FFEA70]">
                                    Host
                                </span>
                            ) : null}
                        </li>
                    ))}
                </ul>

                {isHost ? (
                    <button
                        onClick={handleStart}
                        disabled={busy || room.players.length < 2}
                        className="sec-font text-xl rounded px-8 py-4 bg-[#d30cbcc0] font-bold duration-500 skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc] disabled:opacity-50"
                    >
                        {room.players.length < 2 ? "Waiting for players..." : "Start Game"}
                    </button>
                ) : (
                    <p className="text-lg opacity-80">Waiting for the host to start...</p>
                )}

                {error ? (
                    <p role="alert" className="text-sm text-[#ff9aa8]">
                        {error}
                    </p>
                ) : null}
            </section>
        </div>
    );
}