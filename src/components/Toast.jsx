import { useEffect } from "react";

export default function Toast({ message, onDone }) {
    useEffect(() => {
        if (!message) return;
        const t = setTimeout(onDone, 3000);
        return () => clearTimeout(t);
    }, [message, onDone]);

    if (!message) return null;
    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#111111] border border-[#ffffff40] text-white px-5 py-3 rounded-xl shadow-lg z-50"
        >
            {message}
        </div>
    );
}