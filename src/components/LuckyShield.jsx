
import PropTypes from "prop-types";

export default function LuckyShield({ player }) {
  if (!player) return null;

  // Server sends consecutive_rolls; the old local game used consecutiveRolls
  const streak = player.consecutive_rolls ?? player.consecutiveRolls ?? 0;
  const shields = player.shields ?? 0;

  return (
    <div className="w-full rounded-xl border border-white/20 bg-white/10 p-4 text-white">
      <h3 className="text-center text-lg font-bold">
        🛡️ Lucky Shield
      </h3>

      <p className="mt-2 text-center text-sm text-gray-300">
        Roll 5 times without a 1 to earn a shield!
      </p>

      <div className="my-3 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={`h-3 flex-1 rounded-full ${
              n <= streak ? "bg-green-400" : "bg-gray-600"
            }`}
          />
        ))}
      </div>

      <p className="text-center text-sm">
        Progress: {Math.min(streak, 5)}/5
      </p>

      <div className="mt-3 rounded-lg bg-black/20 p-3 text-center">
        <p className="font-semibold">
          🛡️ Shields Available: {shields}
        </p>

        {shields > 0 ? (
          <p className="mt-1 text-xs text-green-300">
            Ready to protect your points if you roll a 1!
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-400">
            Keep rolling to earn protection
          </p>
        )}
      </div>
    </div>
  );
}

LuckyShield.propTypes = {
  player: PropTypes.shape({
    consecutive_rolls: PropTypes.number,
    consecutiveRolls: PropTypes.number,
    shields: PropTypes.number,
  }),
};
