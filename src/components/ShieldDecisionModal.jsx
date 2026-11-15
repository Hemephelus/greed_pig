
import PropTypes from "prop-types";

export default function ShieldDecisionModal({
  player,
  onUseShield,
  onDecline,
  isBusy = false,
  error = "",
}) {
  if (!player) return null;

  const points = player.running_points;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shield-decision-title"
        className="w-full max-w-md rounded-2xl border border-green-500/30 bg-slate-900 p-6 text-center text-white shadow-2xl animate-[bounceIn_0.35s_ease-out]"
      >
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/15">
          <span className="text-5xl">🎲</span>
        </div>

        <h2
          id="shield-decision-title"
          className="text-2xl font-extrabold text-red-400"
        >
          Oh No! You Rolled a 1!
        </h2>

        <p className="mt-3 text-gray-300">
          {player.name || player.tag}, your turn
          points are at risk!
        </p>

        <div className="my-5 rounded-xl border border-white/10 bg-slate-800 p-4">
          <p className="text-sm text-gray-400">
            Points at Risk
          </p>

          <p className="mt-1 text-4xl font-extrabold text-yellow-400">
            {points}
          </p>

          <p className="mt-2 text-sm text-green-400">
            🛡️ 1 Lucky Shield Available
          </p>
        </div>

        <p className="mb-5 text-sm text-gray-300">
          Would you like to use your Lucky Shield
          to save these points?
        </p>

        {error && (
          <p role="alert" className="mb-4 rounded-lg border border-red-400/50 bg-red-500/20 p-2 text-sm text-red-100">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onUseShield}
            disabled={isBusy}
            className="w-full rounded-xl bg-green-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-green-400 active:scale-95 disabled:opacity-60"
          >
            {isBusy ? "Saving..." : `🛡️ Use Shield — Save ${points} Points`}
          </button>

          <button
            type="button"
            onClick={onDecline}
            disabled={isBusy}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
          >
            Don&apos;t Use Shield
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-400">
          Either choice will end your turn.
        </p>
      </div>
    </div>
  );
}

ShieldDecisionModal.propTypes = {
  player: PropTypes.shape({
    running_points: PropTypes.number,
    name: PropTypes.string,
    tag: PropTypes.string,
  }),
  onUseShield: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
  isBusy: PropTypes.bool,
  error: PropTypes.string,
};
