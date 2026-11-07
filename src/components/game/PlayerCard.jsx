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
      className={`rounded-xl border-2 p-3 ${
        isActive ? "border-yellow-400 bg-yellow-50" : "border-gray-300 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold">{player.name}</h3>
        <span
          className="text-xs"
          aria-label={`${powerupCount} power-ups held`}
        >
          ⚡ {powerupCount}
        </span>
      </div>

      <p className="text-2xl font-bold">{player.total_score}</p>

      {isActive && (
        <p className="text-sm">Turn score: {player.turn_score}</p>
      )}

      <div className="mt-2 flex flex-wrap gap-1">
        {player.shield_active && (
          <Chip className="bg-blue-100 text-blue-800">Shield ready</Chip>
        )}
        {player.double_active && (
          <Chip className="bg-purple-100 text-purple-800">x2</Chip>
        )}
        {player.skip_next_turn && (
          <Chip className="bg-cyan-100 text-cyan-800">Skips next turn</Chip>
        )}
      </div>
    </li>
  );
}