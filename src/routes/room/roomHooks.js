import { useGreedyPigContext } from "src/context/useGreedyPigContext";

export function useRoomImages() {
    const { preloadSrcList } = useGreedyPigContext();
    const pigs = preloadSrcList.filter((s) => !s.includes("dice"));
    const dice = preloadSrcList.filter((s) => s.includes("dice"));
    const avatarFor = (seat) => pigs[(seat * 3) % pigs.length];
    return { avatarFor, dice };
}

export const POWER_UP_INFO = {
    shield: { name: "Shield", text: "Survive your next 1" },
    double: { name: "Double Down", text: "Next roll counts double" },
    freeze: { name: "Freeze", text: "Next player skips a turn" },
    reverse: { name: "Reverse", text: "Flip the turn direction" },
};

export const nameOf = (p) => p?.name || "Player";