import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function SignIn() {
    const { signIn, signOut } = useAuthActions();
    const { isAuthenticated, isLoading } = useConvexAuth();
    const me = useQuery(api.users.me);
    const [flow, setFlow] = useState("signIn"); // "signIn" or "signUp"
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        const formData = new FormData(e.currentTarget);
        formData.set("flow", flow);
        try {
            await signIn("password", formData);
        } catch {
            setError(
                flow === "signIn"
                    ? "Wrong email or password."
                    : "Could not create the account. Use a valid email and a password of at least 8 characters, or sign in if you already have an account."
            );
        } finally {
            setSubmitting(false);
        }
    }

    const inputClass =
        "p-2 bg-[#ffffff20] border rounded-md w-[280px] text-white";

    return (
        <main className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center gap-4 sec-font p-4">
            <h1 className="pri-font text-3xl">
                {isAuthenticated ? "You are signed in" : flow === "signIn" ? "Sign in" : "Create account"}
            </h1>

            {isLoading && <p>Loading...</p>}

            {!isLoading && isAuthenticated && (
                <>
                    <p>
                        Signed in as <b>{me?.name ?? me?.email ?? "..."}</b>
                    </p>
                    <button
                        onClick={() => signOut()}
                        className="bg-[#056FA4c0] px-6 py-2 rounded-lg border"
                    >
                        Sign out
                    </button>
                </>
            )}

            {!isLoading && !isAuthenticated && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    {flow === "signUp" && (
                        <div className="flex flex-col">
                            <label htmlFor="name">Display name</label>
                            <input id="name" name="name" className={inputClass} required />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" className={inputClass} required />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="password">Password (8+ characters)</label>
                        <input id="password" name="password" type="password" minLength={8} className={inputClass} required />
                    </div>
                    {error && <p role="alert" className="text-red-400 max-w-[280px]">{error}</p>}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-[#d30cbcc0] px-6 py-2 rounded-lg font-bold disabled:opacity-50"
                    >
                        {submitting ? "Please wait..." : flow === "signIn" ? "Sign in" : "Create account"}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setFlow(flow === "signIn" ? "signUp" : "signIn"); setError(""); }}
                        className="underline text-sm"
                    >
                        {flow === "signIn" ? "No account? Create one" : "Have an account? Sign in"}
                    </button>
                </form>
            )}
        </main>
    );
}