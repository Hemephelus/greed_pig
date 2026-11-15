import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ONBOARDING_KEY = "greedy-pig-onboarding-v1";

const steps = [
  {
    eyebrow: "WELCOME",
    title: "Meet Greedy Pig",
    body: "Greedy Pig is a turn-based dice game for friends. Your goal is to be the first player to reach the target score.",
    tip: "The default target is 100 points, and you can change it before the game starts.",
  },
  {
    eyebrow: "STEP 1 OF 3",
    title: "Roll to build your turn score",
    body: "On your turn, roll the die. A result from 2 to 6 is added to your running points, and you can roll again.",
    tip: "Running points are not yet safe: they only become part of your total when you pass.",
  },
  {
    eyebrow: "STEP 2 OF 3",
    title: "Choose when to pass",
    body: "Press PASS to bank your running points and hand the turn to the next player.",
    tip: "If you roll a 1, you lose the running points from that turn and the next player goes. The choice is yours: keep rolling or play it safe.",
  },
  {
    eyebrow: "STEP 3 OF 3",
    title: "Set up your table",
    body: "Add at least two players, enter their names, and use the arrows to choose their pig avatars. You can also change the target score.",
    tip: "When everyone is ready, choose Start Game. Have fun!",
  },
];

function hasSeenOnboarding() {
  try {
    return window.localStorage.getItem(ONBOARDING_KEY) === "completed";
  } catch {
    // If browser storage is unavailable, show the guide for this visit.
    return false;
  }
}

function saveOnboardingCompletion() {
  try {
    window.localStorage.setItem(ONBOARDING_KEY, "completed");
  } catch {
    // The guide still works if the browser blocks persistent storage.
  }
}

export default function FirstTimeOnboarding() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(() => !hasSeenOnboarding());
  const [stepIndex, setStepIndex] = useState(0);

  if (!isOpen) return null;

  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  function skipTutorial() {
    saveOnboardingCompletion();
    setIsOpen(false);
  }

  function continueTutorial() {
    if (isLastStep) {
      saveOnboardingCompletion();
      navigate("/live-game/setup");
      return;
    }

    setStepIndex((currentIndex) => currentIndex + 1);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
      onKeyDown={(event) => {
        if (event.key === "Escape") skipTutorial();
      }}
    >
      <section
        aria-labelledby="onboarding-title"
        aria-modal="true"
        className="w-full max-w-xl rounded-2xl border border-white/20 bg-[#17131c] p-6 text-white shadow-2xl sm:p-9"
        role="dialog"
      >
        <div className="mb-7 flex items-center justify-between gap-4">
          <p className="pri-font text-xs tracking-[0.2em] text-[#F17BE3]">
            GREEDY PIG GUIDE
          </p>
          <button
            autoFocus
            className="rounded px-2 py-1 text-sm text-white/70 underline decoration-white/40 underline-offset-4 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#F17BE3]"
            onClick={skipTutorial}
            type="button"
          >
            Skip tutorial
          </button>
        </div>

        <div
          aria-label={`Step ${stepIndex + 1} of ${steps.length}`}
          className="mb-6 flex gap-2"
          role="group"
        >
          {steps.map((item, index) => (
            <span
              aria-current={index === stepIndex ? "step" : undefined}
              className={`h-1.5 flex-1 rounded-full ${
                index <= stepIndex ? "bg-[#D30CBD]" : "bg-white/15"
              }`}
              key={item.title}
            />
          ))}
        </div>

        <div aria-live="polite">
          <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#76C9F1]">
            {step.eyebrow}
          </p>
          <h2
            className="pri-font mb-4 text-2xl leading-snug sm:text-3xl"
            id="onboarding-title"
          >
            {step.title}
          </h2>
          <p className="text-base leading-7 text-white/85 sm:text-lg">
            {step.body}
          </p>
          <p className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/75 sm:text-base">
            {step.tip}
          </p>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            className="rounded-lg border border-white/25 px-5 py-3 font-semibold text-white/80 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#76C9F1] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((currentIndex) => currentIndex - 1)}
            type="button"
          >
            Back
          </button>
          <button
            className="rounded-lg bg-[#D30CBD] px-6 py-3 font-bold text-white transition hover:bg-[#ed20d5] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#17131c]"
            onClick={continueTutorial}
            type="button"
          >
            {isLastStep ? "Set up players" : "Next"}
          </button>
        </div>
      </section>
    </div>
  );
}
