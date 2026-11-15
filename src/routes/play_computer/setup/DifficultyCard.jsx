/* eslint-disable react/prop-types */
import selectSound from "src/sound_effect/selection_button.mp3";
import useAudio from "src/hooks/useAudio";

// One clickable card for a computer difficulty level.
//   difficulty: an entry of DIFFICULTY_LEVELS ({ level, label, pigName, description })
//   selected:   true when this is the chosen level (gets the pink highlight)
//   onSelect:   called when the card is clicked
export default function DifficultyCard({ difficulty, selected, onSelect }) {
  const selectAudio = useAudio(selectSound);

  function handleClick() {
    selectAudio?.play();
    onSelect();
  }

  return (
    // type="button" so a click never submits the setup form by accident
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={selected}
      className={`flex flex-col gap-1 rounded-lg border p-3 text-left duration-300 active:scale-95 ${
        selected
          ? "border-[#D30CBD] bg-[#D30CBD40]"
          : "border-[#FFFFFF40] bg-[#ffffff10] hover:border-[#ffffff80] hover:bg-[#ffffff20]"
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="pri-font text-lg">{difficulty.pigName}</span>
        <span className="rounded bg-[#ffffff20] px-2 text-xs font-bold">
          Level {difficulty.level}
        </span>
      </span>
      <span className="text-sm font-bold text-[#FFEA70]">{difficulty.label}</span>
      <span className="text-sm text-[#ffffffc0]">{difficulty.description}</span>
    </button>
  );
}