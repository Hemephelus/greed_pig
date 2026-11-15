import { useEffect } from "react";
import { useGameSession } from "src/context/GameSessionContext";

// How long an error stays on screen before it hides itself.
const AUTO_HIDE_MS = 4000;

// Shows the last API error from useGameSession(), e.g. "Cannot reach the game server".
// It hides itself after about 4 seconds, or sooner if the player clicks Dismiss.
export default function ErrorBanner() {
  const { error, clearError } = useGameSession();

  // Start a timer whenever a new error appears. Cancel it if the error
  // changes or the banner goes away, so old timers never clear a new error.
  useEffect(() => {
    if (!error) return undefined;
    const timer = setTimeout(clearError, AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [error, clearError]);

  if (!error) return null;

  return (
    <div
      role="alert"
      className="sec-font mx-auto flex w-full max-w-prose items-center justify-between gap-4 rounded-lg border border-[#D30C0C80] bg-[#D30C0C40] p-3 text-white"
    >
      <span>{error.message}</span>
      <button
        onClick={clearError}
        className="text-sm underline duration-300 hover:text-[#FFEA70]"
        aria-label="Dismiss error"
      >
        Dismiss
      </button>
    </div>
  );
}