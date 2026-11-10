export default function DiceArea({ die, message, bust }) {
  return (
    <section
      aria-label="Dice"
      className="flex flex-col items-center gap-3 rounded-lg border border-[#FFFFFF40] bg-[#ffffff10] p-4 text-white"
    >
      <div
        className={`grid h-20 w-20 place-content-center rounded-lg border-2 text-4xl font-bold duration-300 ${
          bust
            ? "border-red-400 bg-[#ef444440]"
            : "border-[#FFFF8F] bg-[#ffffff20]"
        }`}
        aria-label={die ? `Die shows ${die}` : "Die not rolled yet"}
      >
        {die ?? "?"}
      </div>

      <p role="status" aria-live="polite" className="text-center text-sm lg:text-base">
        {message || "Roll the die to start."}
      </p>
    </section>
  );
}