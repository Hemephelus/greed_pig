import { FaShieldAlt, FaSnowflake, FaExchangeAlt } from "react-icons/fa";

const POWER_UPS = {
    shield: { label: "Shield", hint: "Survive your next 1", color: "#056FA4", icon: <FaShieldAlt size={22} /> },
    double: { label: "Double Down", hint: "Your next roll counts double", color: "#D30CBD", icon: <span className="font-bold text-lg">×2</span> },
    freeze: { label: "Freeze", hint: "Next player skips a turn", color: "#38BDF8", icon: <FaSnowflake size={22} /> },
    reverse: { label: "Reverse", hint: "Flip the direction of play", color: "#F59E0B", icon: <FaExchangeAlt size={22} /> },
};

export default function PowerUpTray({ powerUps = [], disabled = false, onUse }) {
    const slots = [0, 1]; // you can hold at most 2
    return (
        <div className="flex gap-3" role="group" aria-label="Your power-ups">
            {slots.map((i) => {
                const id = powerUps[i];
                const p = id ? POWER_UPS[id] : null;
                return p ? (
                    <button
                        key={i}
                        type="button"
                        disabled={disabled}
                        onClick={() => onUse(id)}
                        title={`${p.label}: ${p.hint}`}
                        aria-label={`Use ${p.label}. ${p.hint}`}
                        style={{ borderColor: p.color, boxShadow: `0 0 18px ${p.color}66` }}
                        className="w-[84px] h-[96px] rounded-xl border-2 bg-[#ffffff10] text-white flex flex-col items-center justify-center gap-1 duration-300 hover:scale-105 active:scale-100 disabled:opacity-40 disabled:hover:scale-100"
                    >
                        <span style={{ color: p.color }}>{p.icon}</span>
                        <span className="text-xs font-semibold">{p.label}</span>
                    </button>
                ) : (
                    <div
                        key={i}
                        aria-hidden="true"
                        className="w-[84px] h-[96px] rounded-xl border-2 border-dashed border-[#ffffff30] text-[#ffffff40] flex items-center justify-center text-xs"
                    >
                        Empty
                    </div>
                );
            })}
        </div>
    );
}