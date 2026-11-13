import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Navbar from "src/components/Navbar";
import cleanError from "src/utils/cleanError";
import Lobby from "./Lobby";
import OnlineGame from "./OnlineGame";

function Notice({ title, children, showHome = true }) {
    return (
        <div>
            <Navbar />
            <section className="text-white text-center grid place-content-center justify-items-center gap-4 p-8 min-h-[60vh]">
                <h2 className="pri-font text-3xl">{title}</h2>
                {children}
                {showHome ? (
                    <Link
                        to="/"
                        className="sec-font rounded px-8 py-3 bg-[#d30cbcc0] font-bold hover:bg-[#d30cbc] duration-300"
                    >
                        Home
                    </Link>
                ) : null}
            </section>
        </div>
    );
}

export default function RoomPage() {
    const { code: rawCode } = useParams();
    const code = (rawCode ?? "").toUpperCase();
    const { isAuthenticated, isLoading } = useConvexAuth();
    const room = useQuery(api.rooms.getRoom, isAuthenticated ? { code } : "skip");
    const me = useQuery(api.users.me, isAuthenticated ? {} : "skip");
    const joinRoom = useMutation(api.rooms.joinRoom);
    const [joinError, setJoinError] = useState("");
    const triedJoin = useRef(false);

    const myUserId = me?._id;
    const isMember =
        !!room && !!myUserId && room.players.some((p) => p.userId === myUserId);

    useEffect(() => {
        if (room && myUserId && !isMember && room.status === "lobby" && !triedJoin.current) {
            triedJoin.current = true;
            joinRoom({ code }).catch((e) => setJoinError(cleanError(e)));
        }
    }, [room, myUserId, isMember, code, joinRoom]);

    if (isLoading || (isAuthenticated && (room === undefined || me === undefined))) {
        return (
            <Notice title="Loading room..." showHome={false}>
                <p className="opacity-70">One moment.</p>
            </Notice>
        );
    }

    if (!isAuthenticated) {
        return (
            <Notice title="Sign in to join this room">
                <p className="opacity-80">Room {code} is waiting for you.</p>
                <Link
                    to={`/sign-in?next=/room/${code}`}
                    className="sec-font rounded px-8 py-3 bg-[#056FA4c0] font-bold hover:bg-[#056FA4] duration-300"
                >
                    Sign in / Sign up
                </Link>
            </Notice>
        );
    }

    if (room === null) {
        return (
            <Notice title="Room not found">
                <p className="opacity-80">Check the code {code} and try again.</p>
            </Notice>
        );
    }

    if (joinError) {
        return (
            <Notice title="Couldn't join this room">
                <p role="alert" className="text-[#ff9aa8]">
                    {joinError}
                </p>
            </Notice>
        );
    }

    if (!isMember && room.status !== "lobby") {
        return (
            <Notice title="This game has already started">
                <p className="opacity-80">Ask the host to create a new room.</p>
            </Notice>
        );
    }

    if (!isMember) {
        return (
            <Notice title="Joining room..." showHome={false}>
                <p className="opacity-70">One moment.</p>
            </Notice>
        );
    }

    if (room.status === "lobby") return <Lobby room={room} myUserId={myUserId} />;
    return <OnlineGame room={room} myUserId={myUserId} />;
}