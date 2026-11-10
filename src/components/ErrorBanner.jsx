import { useGameSession } from "src/context/GameSessionContext";

// Shows the last API error from useGameSession(), e.g. "Cannot reach the game server".
// T7 (see INTEGRATION_TASKS.md): place <ErrorBanner /> at the top of Setup.jsx and Game.jsx, match the
//   app's styling, and auto-hide it after ~4 seconds (call clearError()).
export default function ErrorBanner() {
  const { error, clearError } = useGameSession();
  if (!error) return null;

  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-lg border border-[#D30C0C80] bg-[#D30C0C40] p-3 text-white"
    >
      <span>{error.message}</span>
      <button onClick={clearError} className="text-sm underline" aria-label="Dismiss error">
        Dismiss
      </button>
    </div>
  );
}
