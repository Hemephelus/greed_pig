export default function PlayerBadges({ player }) {
    const badges = [];
    if (player.shieldArmed) badges.push({ key: "shield", text: "Shield on", color: "#056FA4" });
    if (player.doubleArmed) badges.push({ key: "double", text: "×2 next roll", color: "#D30CBD" });
    if (player.frozen) badges.push({ key: "frozen", text: "Frozen", color: "#38BDF8" });
    if (badges.length === 0) return null;

    return (
        <div className="flex gap-1 flex-wrap" aria-label="Active effects">
            {badges.map((b) => (
                <span
                    key={b.key}
                    style={{ borderColor: b.color, color: b.color }}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-[#ffffff10]"
                >
                    {b.text}
                </span>
            ))}
        </div>
    );
}