import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import logo from "../assets/pig-0.png";

const inputClass =
  "w-full rounded bg-[#ffffff20] border border-[#ffffff60] px-3 py-2 text-white placeholder-[#ffffff80] focus:outline-none focus:ring-2 focus:ring-[#d30cbd]";

export default function SignIn() {
  const { signIn, signOut } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Where to go after signing in, e.g. /sign-in?next=/room/ABC234.
  // Only allow paths inside our own site.
  const rawNext = params.get("next") ?? "/";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  const [flow, setFlow] = useState("signIn"); // "signIn" or "signUp"
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const formData = new FormData(e.currentTarget);
    formData.set("flow", flow);
    try {
      await signIn("password", formData);
      navigate(next);
    } catch {
      setError(
        flow === "signIn"
          ? "Wrong email or password."
          : "Could not create the account. Use a password of at least 8 characters, and check that the email isn't already registered."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 py-10 text-white">
      <Link to="/" className="flex flex-col items-center gap-2">
        <img src={logo} alt="" width={120} />
        <h1 className="pri-font text-4xl">Greedy Pig</h1>
      </Link>

      <div className="w-full max-w-sm rounded-lg border border-[#ffffff40] bg-[#00000040] p-6">
        {isLoading ? (
          <p className="text-center opacity-80">Loading...</p>
        ) : isAuthenticated ? (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-lg">You're signed in.</p>
            <button
              onClick={() => navigate(next)}
              className="sec-font rounded px-6 py-3 bg-[#d30cbcc0] font-bold hover:bg-[#d30cbc] duration-300"
            >
              Continue
            </button>
            <button
              onClick={() => signOut()}
              className="rounded px-6 py-3 font-bold border border-[#ffffff80] hover:bg-[#ffffff20] duration-300"
            >
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="pri-font text-2xl text-center">
              {flow === "signIn" ? "Sign in" : "Create account"}
            </h2>

            {flow === "signUp" ? (
              <div className="flex flex-col gap-1">
                <label htmlFor="name" className="text-sm">
                  Display name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="nickname"
                  placeholder="What should players call you?"
                  className={inputClass}
                />
              </div>
            ) : null}

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={
                  flow === "signIn" ? "current-password" : "new-password"
                }
                placeholder="At least 8 characters"
                className={inputClass}
              />
            </div>

            {error ? (
              <p role="alert" className="text-sm text-[#ff9aa8]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="sec-font rounded px-6 py-3 bg-[#d30cbcc0] font-bold hover:bg-[#d30cbc] duration-300 disabled:opacity-60"
            >
              {busy
                ? "Please wait..."
                : flow === "signIn"
                ? "Sign in"
                : "Create account"}
            </button>

            <button
              type="button"
              onClick={() => {
                setFlow(flow === "signIn" ? "signUp" : "signIn");
                setError("");
              }}
              className="text-sm underline text-center hover:text-[#d30cbc]"
            >
              {flow === "signIn"
                ? "No account? Create one"
                : "Already have an account? Sign in"}
            </button>
          </form>
        )}
      </div>

      <Link to="/" className="text-sm underline opacity-80 hover:opacity-100">
        Back to home
      </Link>
    </section>
  );
}