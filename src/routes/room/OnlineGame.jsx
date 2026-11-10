import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "convex/react";
import Confetti from "react-confetti";
import { api } from "../../../convex/_generated/api";
import Navbar from "src/components/Navbar";
import cleanError from "src/utils/cleanError";
import useAudio from "src/hooks/useAudio";
import diceRollSound from "src/sound_effect/dice_roll.mp3";
import loseSound from "src/sound_effect/lose_sound.mp3";
import celebrationSound from "src/sound_effect/celebration.mp3";
import addPlayerSound from "src/sound_effect/add_player.mp3";
import { useRoomImages, POWER_UP_INFO, nameOf } from "./roomHooks";

function describeResult(r) {
    if (r.won) return { text: `You rolled ${r.value} and won the game!`, kind: "good" };
    if (r.shielded)
        return { text: "You rolled a 1, but your Shield saved you!", kind: "good" };
    if (r.busted)
        return { text: "You rolled a 1. Your running points are gone.", kind: "bad" };
    let text = `You rolled ${r.value}`;
    if (r.gained && r.gained !== r.value) text += ` (doubled to +${r.gained})`;
    text += ".";
    if (r.earned) text += ` You earned ${POWER_UP_INFO[r.earned]?.name ?? r.earned}!`;
    return { text, kind: "neutral" };
}

const messageStyle = {
    good: "border-[#4ade80] bg-[#4ade8020] text-[#bbf7d0]",
    bad: "border-[#E71D36] bg-[#E71D3620] text-[#F17E8C]",
    error: "border-[#E71D36] bg-[#E71D3620] text-[#F17E8C]",
    neutral: "border-[#ffffff60] bg-[#ffffff15] text-white",
};

function Badges({ p }) {
    const pill = "text-xs rounded px-2 py-0.5 ml-2 border";
    return (
        <>
            {p.shieldArmed ? (
                <span className={`${pill} border-[#056FA4] bg-[#056FA460]`}>Shield on</span>
            ) : null}
            {p.doubleArmed ? (
                <span className={`${pill} border-[#FFD700] bg-[#FFD70030]`}>2x ready</span>
            ) : null}
            {p.frozen ? (
                <span className={`${pill} border-[#7dd3fc] bg-[#7dd3fc30]`}>Frozen</span>
            ) : null}
        </>
    );
}

export default function OnlineGame({ room, myUserId }) {
    const code = room.code;
    const rollMutation = useMutation(api.game.roll);
    const passMutation = useMutation(api.game.pass);
    const activateMutation = useMutation(api.game.activatePowerUp);
    const { avatarFor, dice } = useRoomImages();
    const rollAudio = useAudio(diceRollSound);
    const loseAudio = useAudio(loseSound);
    const celebrationAudio = useAudio(celebrationSound);
    const passAudio = useAudio(addPlayerSound);

    const [rolling, setRolling] = useState(false);
    const [face, setFace] = useState(0);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState(null);

    const players = room.players;
    const me = players.find((p) => p.userId === myUserId);
    const current = players.find((p) => p.seat === room.currentSeat) ?? players[0];
    const isMyTurn = room.status === "playing" && !!me && me.seat === room.currentSeat;
    const finished = room.status === "finished";
    const winner = players.find((p) => p.userId === room.winnerId);
    const reversed = (room.direction ?? 1) === -1;
    const shownFace = rolling ? face : room.lastRoll ? room.lastRoll - 1 : 5;
    const leaderBoard = [...players].sort(
        (a, b) => b.totalPoints + b.runningPoints - (a.totalPoints + a.runningPoints)
    );

    useEffect(() => {
        if (!rolling) return;
        const id = setInterval(() => setFace(Math.floor(Math.random() * 6)), 100);
        return () => clearInterval(id);
    }, [rolling]);

    useEffect(() => {
        if (!message) return;
        const t = setTimeout(() => setMessage(null), 5000);
        return () => clearTimeout(t);
    }, [message]);

    async function handleRoll() {
        if (!isMyTurn || busy) return;
        setBusy(true);
        setMessage(null);
        setRolling(true);
        rollAudio?.play();
        try {
            const [result] = await Promise.all([
                rollMutation({ code }),
                new Promise((r) => setTimeout(r, 800)),
            ]);
            setMessage(describeResult(result));
            if (result.won) celebrationAudio?.play();
            else if (result.busted && !result.shielded) loseAudio?.play();
        } catch (e) {
            setMessage({ text: cleanError(e), kind: "error" });
        } finally {
            setRolling(false);
            setBusy(false);
        }
    }

    async function handlePass() {
        if (!isMyTurn || busy || !(me?.runningPoints > 0)) return;
        setBusy(true);
        try {
            await passMutation({ code });
            passAudio?.play();
            setMessage({ text: "You banked your points.", kind: "neutral" });
        } catch (e) {
            setMessage({ text: cleanError(e), kind: "error" });
        } finally {
            setBusy(false);
        }
    }

    async function handlePowerUp(id) {
        if (!isMyTurn || busy || rolling) return;
        setBusy(true);
        try {
            await activateMutation({ code, powerUp: id });
            setMessage({
                text: `You used ${POWER_UP_INFO[id]?.name ?? id}.`,
                kind: "good",
            });
        } catch (e) {
            setMessage({ text: cleanError(e), kind: "error" });
        } finally {
            setBusy(false);
        }
    }

    const rowBase =
        "w-full text-base lg:text-xl p-2 rounded-lg border border-[#FFFFFF40] hover:border-[#ffffff80] duration-300 text-center text-white";

    return (
        <div className="flex flex-col md:grid md:grid-cols-[minmax(auto,_200px)_1fr_minmax(auto,_200px)] lg:grid-cols-[minmax(auto,_250px)_1fr_minmax(auto,_250px)] xl:grid-cols-[auto_1fr_minmax(auto,_300px)] relative">
            {/* Left: dice, pass, power-ups, info */}
            <aside className="order-2 md:order-1 md:h-screen md:border-r border-r-[#ffffff40] flex flex-col items-center justify-around gap-4 p-4 md:p-8 md:sticky md:top-0 bg-[#00000010]">
                <button
                    onClick={handleRoll}
                    disabled={!isMyTurn || busy}
                    aria-label="Roll the dice"
                    className="hover:scale-105 active:scale-100 duration-300 w-[200px] md:w-auto disabled:opacity-60 disabled:hover:scale-100"
                >
                    {dice[shownFace] ? (
                        <img src={dice[shownFace]} alt={`Dice showing ${shownFace + 1}`} />
                    ) : null}
                </button>
                <p className="text-white text-center text-sm">
                    {isMyTurn
                        ? "Your turn. Tap the dice to roll."
                        : `Waiting for ${nameOf(current)}...`}
                </p>

                <button
                    onClick={handlePass}
                    disabled={!isMyTurn || busy || !(me?.runningPoints > 0)}
                    className="bg-[#056FA4c0] w-full text-white text-center text-base lg:text-xl xl:text-2xl font-semibold py-2 lg:py-4 rounded-lg border hover:scale-105 active:scale-100 duration-300 disabled:opacity-50 disabled:hover:scale-100"
                >
                    PASS
                </button>

                <div className="w-full text-white bg-[#ffffff10] rounded-lg border border-[#ffffff40] p-3 flex flex-col gap-2">
                    <p className="text-center text-sm lg:text-base font-semibold">
                        Power-ups
                    </p>
                    {me?.powerUps?.length ? (
                        me.powerUps.map((id, i) => {
                            const info = POWER_UP_INFO[id] ?? { name: id, text: "" };
                            return (
                                <button
                                    key={id + i}
                                    onClick={() => handlePowerUp(id)}
                                    disabled={!isMyTurn || busy || rolling}
                                    className="rounded border border-[#ffffff60] bg-[#D30CBD60] hover:bg-[#D30CBD] disabled:opacity-50 px-3 py-2 text-left duration-300"
                                >
                                    <span className="block font-bold text-sm">{info.name}</span>
                                    <span className="block text-xs opacity-80">{info.text}</span>
                                </button>
                            );
                        })
                    ) : (
                        <p className="text-center text-xs opacity-70">
                            None yet. Roll a 6 to earn one.
                        </p>
                    )}
                </div>

                <div className="text-white grid place-content-center gap-1 bg-[#ffffff10] w-full p-4 rounded-lg border border-[#ffffff40]">
                    <p className="text-center text-sm lg:text-lg">{players.length} players</p>
                    <p className="text-center text-sm lg:text-lg">{room.maxPoints} max points</p>
                    <p className="text-center text-xs opacity-70">Room {code}</p>
                </div>
                <Link to="/" className="text-white text-sm underline">
                    Home
                </Link>
            </aside>

            {/* Middle: message, direction, table */}
            <div className="order-1 md:order-2 space-y-2 p-2">
                <Navbar />
                <div
                    role="status"
                    aria-live="polite"
                    className="min-h-[48px] flex items-center justify-center"
                >
                    {message ? (
                        <p
                            className={`w-full text-center rounded-lg border px-3 py-2 ${messageStyle[message.kind] ?? messageStyle.neutral
                                }`}
                        >
                            {message.text}
                        </p>
                    ) : null}
                </div>
                <p className="text-center text-white text-sm">
                    Turn direction: {reversed ? "↺ Reversed" : "↻ Normal"}
                </p>

                {/* Mobile: current player strip */}
                <div className="md:hidden flex items-center justify-between gap-2 text-white rounded-lg border border-[#ffffffc0] bg-[#ffffff10] p-2">
                    <img src={avatarFor(current.seat)} alt="" className="h-[40px]" />
                    <span className="flex-1">
                        {nameOf(current)}'s Turn
                        <Badges p={current} />
                    </span>
                    <span>{current.totalPoints + current.runningPoints}</span>
                    <span className="opacity-70">+{current.runningPoints}</span>
                </div>

                {/* Desktop: player table */}
                <table className="hidden md:table w-full">
                    <thead>
                        <tr className="w-full h-[50px] bg-[#ffffff20] text-sm lg:text-base rounded-lg border border-[#FFFFFF40]">
                            <th className="text-center text-white">Icons</th>
                            <th className="text-center text-white">Name</th>
                            <th className="text-center text-white">Total Points</th>
                            <th className="text-center text-white">Running Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((p) => (
                            <tr
                                key={p._id}
                                className={`${p.seat === room.currentSeat ? "bg-[#ffffff40]" : "bg-[#ffffff10]"
                                    } ${rowBase}`}
                            >
                                <td className="h-[70px] p-2 grid place-content-center">
                                    <figure className="w-[50px] bg-[#ffffff20] p-2 border border-[#FFFF8F40] rounded">
                                        <img src={avatarFor(p.seat)} alt="" />
                                    </figure>
                                </td>
                                <td>
                                    {nameOf(p)}
                                    {p.userId === myUserId ? " (you)" : ""}
                                    <Badges p={p} />
                                </td>
                                <td>{p.totalPoints + p.runningPoints}</td>
                                <td>{p.runningPoints}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Right: current player and leader board */}
            <section className="order-3 md:h-screen md:border-l border-l-[#ffffff40] md:sticky md:top-0 flex flex-col md:grid md:grid-rows-[auto_auto_1fr] bg-[#00000010] text-[#F9F7E8] overflow-auto">
                <div className="hidden md:flex h-[250px] flex-col items-center justify-center gap-2 text-sm lg:text-base">
                    <figure className="w-[150px] h-[150px] flex justify-center items-center bg-[#ffffff20] p-2 rounded-lg border border-[#FFFFFF40]">
                        <img src={avatarFor(current.seat)} alt="" />
                    </figure>
                    {nameOf(current)}'s Turn
                </div>
                <div className="bg-[#ffffff10] text-lg lg:text-xl xl:text-2xl font-extrabold border-y border-[#ffffff80] py-2 lg:py-4 text-center">
                    Leader Board
                </div>
                <div className="overflow-y-auto p-2 bg-[#00000010]">
                    <table className="w-full">
                        <tbody>
                            {leaderBoard.map((p, index) => (
                                <tr
                                    key={p._id}
                                    className={`${index === 0
                                        ? "bg-[#FFD70010] text-[#FFEA70] border-[#FFD700c0]"
                                        : index === leaderBoard.length - 1
                                            ? "bg-[#E71D3610] text-[#F17E8C] border-[#E71D36c0]"
                                            : "bg-[#ffffff10] text-[#ffffff] border-[#ffffffc0]"
                                        } w-full h-[50px] rounded-lg border duration-300 text-base lg:text-lg`}
                                >
                                    <td className="text-center p-1">{index + 1}</td>
                                    <td className="w-[50px]">
                                        <figure className="h-[40px] p-2">
                                            <img src={avatarFor(p.seat)} alt="" />
                                        </figure>
                                    </td>
                                    <td>{nameOf(p)}</td>
                                    <td>{p.totalPoints + p.runningPoints}</td>
                                    <td className="md:hidden opacity-70">+{p.runningPoints}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {finished ? (
                <div className="fixed inset-0 z-50 overflow-auto bg-[#000000c0] flex justify-center items-center text-white">
                    <Confetti width={window.innerWidth} height={window.innerHeight} />
                    <section className="grid place-content-center gap-4 w-[400px] max-w-full px-4 py-8">
                        {winner ? (
                            <figure className="flex justify-center w-full">
                                <img src={avatarFor(winner.seat)} alt="" width={240} />
                            </figure>
                        ) : null}
                        <p className="text-center text-4xl md:text-5xl pri-font capitalize">
                            {winner ? `${nameOf(winner)} wins` : "Game over"}
                        </p>
                        <Link
                            to="/"
                            className="text-center sec-font text-xl rounded px-8 py-4 bg-[#d30cbcc0] font-bold duration-500 skew-x-6 hover:skew-x-0 hover:scale-95 hover:bg-[#d30cbc]"
                        >
                            Home
                        </Link>
                    </section>
                </div>
            ) : null}
        </div>
    );
}