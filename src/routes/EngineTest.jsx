import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import PowerUpTray from "src/components/PowerUpTray";
import PlayerBadges from "../components/PlayerBadges";
import DirectionArrow from "../components/DirectionArrow";
import Toast from "../components/Toast";
import { describeRoll } from "../utils/describeRoll";

export default function EngineTest() {
    const [code, setCode] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [message, setMessage] = useState("");

    const room = useQuery(api.rooms.getRoom, code ? { code } : "skip");
    const createRoom = useMutation(api.rooms.createRoom);
    const joinRoom = useMutation(api.rooms.joinRoom);
    const startGame = useMutation(api.rooms.startGame);
    const roll = useMutation(api.game.roll);
    const pass = useMutation(api.game.pass);
    const activate = useMutation(api.game.activatePowerUp);
    const devGrant = useMutation(api.game.devGrant);
    const meUser = useQuery(api.users.me);
    const myPlayer = room?.players.find((p) => p.userId === meUser?._id);
    const myTurn = room?.status === "playing" && myPlayer?.seat === room?.currentSeat;
    const [toast, setToast] = useState("");

    async function run(fn) {
        setMessage("");
        try {
            const result = await fn();
            setMessage(JSON.stringify(result ?? "ok"));
        } catch (e) {
            setMessage(e.message);
        }
    }

    const btn = "bg-[#056FA4c0] px-4 py-2 rounded-lg border";

    return (
        <main className="min-h-screen bg-[#111111] text-white p-6 space-y-4 sec-font">
            <h1 className="pri-font text-2xl">Engine test (temporary)</h1>
            <p>Sign in at /sign-in first. Use a second browser window (private/incognito) for player 2.</p>

            <div className="flex gap-2 flex-wrap items-center">
                <button className={btn} onClick={() => run(async () => { const c = await createRoom({ maxPoints: 30 }); setCode(c); return c; })}>
                    Create room (30 points)
                </button>
                <input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="Room code" className="p-2 bg-[#ffffff20] border rounded-md" />
                <button className={btn} onClick={() => run(async () => { const c = await joinRoom({ code: joinCode }); setCode(c); return c; })}>
                    Join
                </button>
            </div>

            {code && (
                <div className="flex gap-2 flex-wrap">
                    <button className={btn} onClick={() => run(() => startGame({ code }))}>Start game (host)</button>
                    <button className={btn} onClick={() => run(async () => { const r = await roll({ code }); setToast(describeRoll(r)); return r; })}>Roll</button>
                    <button className={btn} onClick={() => run(() => pass({ code }))}>Pass</button>
                </div>
            )}

            {code && (
                <div className="flex gap-3 flex-wrap">
                    {["shield", "double", "freeze", "reverse"].map((p) => (
                        <span key={p} className="flex gap-1">
                            <button className={btn} onClick={() => run(() => devGrant({ code, powerUp: p }))}>
                                + {p} (dev)
                            </button>
                            <button className={btn} onClick={() => run(() => activate({ code, powerUp: p }))}>
                                Use {p}
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {myPlayer && (
                <PowerUpTray
                    powerUps={myPlayer.powerUps}
                    disabled={!myTurn}
                    onUse={(id) => run(() => activate({ code, powerUp: id }))}
                />
            )}

            {room && (
                <div className="space-y-2">
                    <DirectionArrow direction={room.direction ?? 1} />
                    {room.players.map((p) => (
                        <div key={p._id} className="flex items-center gap-2">
                            <span>{p.name}</span>
                            <PlayerBadges player={p} />
                        </div>
                    ))}
                </div>
            )}
            <Toast message={toast} onDone={() => setToast("")} />

            {message && <p className="text-yellow-300">Result: {message}</p>}
            <pre className="bg-[#ffffff10] p-3 rounded-md overflow-auto text-sm">
                {room === undefined ? "No room yet" : JSON.stringify(room, null, 2)}
            </pre>
        </main>
    );
}