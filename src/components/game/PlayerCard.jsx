const Chip = ({ children, className }) => (
  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>
    {children}
  </span>
);

export default function PlayerCard({ player, isActive }) {
  const powerupCount = player.powerups?.length ?? 0;

  return (
    <li
      aria-current={isActive ? "true" : undefined}
      className={`list-none rounded-lg border p-3 text-white duration-300 ${
        isActive
          ? "bg-[#ffffff40] border-[#FFFF8F] hover:border-[#FFFF8F]"
          : "bg-[#ffffff10] border-[#FFFFFF40] hover:border-[#ffffff80]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-bold lg:text-xl">{player.name}</h3>
        <span className="text-xs" aria-label={`${powerupCount} power-ups held`}>
          ⚡ {powerupCount}
        </span>
      </div>

      <p className="text-2xl font-bold">{player.total_score}</p>

      {isActive && <p className="text-sm">Turn score: {player.turn_score}</p>}

      <div className="mt-2 flex flex-wrap gap-1">
        {player.shield_active && (
          <Chip className="bg-[#3b82f650] text-blue-100">Shield ready</Chip>
        )}
        {player.double_active && (
          <Chip className="bg-[#a00f9660] text-purple-100">x2</Chip>
        )}
        {player.skip_next_turn && (
          <Chip className="bg-[#22d3ee40] text-cyan-100">Skips next turn</Chip>
        )}
      </div>
    </li>
  );
}