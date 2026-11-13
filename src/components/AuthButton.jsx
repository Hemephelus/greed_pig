import { Link, useNavigate } from "react-router-dom";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";

export default function AuthButton() {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const { signOut } = useAuthActions();
    const me = useQuery(api.users.me, isAuthenticated ? {} : "skip");
    const navigate = useNavigate();

    if (isLoading) return null;

    if (!isAuthenticated) {
        return (
            <Link
                to="/sign-in"
                className="sec-font font-bold rounded px-4 py-2 text-sm md:text-base bg-[#d30cbcc0] text-white hover:bg-[#d30cbc] duration-300"
            >
                Sign in / Sign up
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-3 text-white">
            <Link to="/history" className="text-sm underline hover:text-[#d30cbd]">
                History
            </Link>
            <span className="hidden sm:inline text-sm opacity-80">
                {me?.name ?? me?.email ?? "Signed in"}
            </span>
            <button
                onClick={async () => {
                    await signOut();
                    navigate("/");
                }}
                className="sec-font font-bold rounded px-4 py-2 text-sm md:text-base border border-[#ffffff80] hover:bg-[#ffffff20] duration-300"
            >
                Sign out
            </button>
        </div>
    );
}