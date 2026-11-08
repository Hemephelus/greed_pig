import { useLiveGameContext } from "src/context/useLiveGameContext";

export default function ErrorBanner() {
  const { apiError, setApiError } = useLiveGameContext();
  if (!apiError) return null;

  return (
    <div
      role="alert"
      className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg border border-[#ffffff80] bg-[#D30C0C] px-4 py-2 text-white shadow-lg max-w-[90%]"
    >
      <span>{apiError}</span>
      <button onClick={() => setApiError("")} aria-label="Dismiss error" className="font-bold">
        ✕
      </button>
    </div>
  );
}
