/* eslint-disable react/prop-types */

// A see-through cover placed over the dice controls during the computer's turn,
// so the human can't click Roll or Pass for it. The server would ignore those
// clicks anyway; this just makes it obvious whose turn it is.
// The parent must be positioned (relative, sticky, etc.) for the cover to fit it.
export default function ComputerTurnLock({ locked }) {
  if (!locked) return null;

  return (
    <div className="absolute inset-0 z-10 grid cursor-not-allowed place-content-center bg-[#00000060]">
      <p className="sec-font rounded-lg bg-[#056FA4c0] px-4 py-2 text-center text-white">
         Computer&apos;s turn
      </p>
    </div>
  );
}