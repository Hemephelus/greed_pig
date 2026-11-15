/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import { POWERUP_TYPES } from "src/constants/game";
import { POWERUP_INFO } from "src/constants/powerups";

// Muddy Trotters needs a target. Lists every other player; anyone already
// carrying muddy trotters is shown but disabled, so you can see why.
export default function TargetPickerDialog({ targets, onPick, onCancel }) {
  const panelRef = useRef(null);
  const info = POWERUP_INFO[POWERUP_TYPES.MUDDY_TROTTERS];

  // Esc closes. K2 may also handle Esc in the shortcuts hook; both just close.
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  // Move focus into the dialog so a keyboard user isn't left behind the overlay
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#000000c0] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`${info.label}: pick a player`}
        className="w-[360px] max-w-full bg-[#111111] border border-[#ffffff40] rounded-xl p-5 flex flex-col gap-4 outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-1">
          <h3 className="pri-font text-2xl text-[#F9F7E8]">
            <span aria-hidden="true">{info.icon}</span> {info.label}
          </h3>
          <p className="text-xs text-[#ffffff99]">
            Pick a player. Their next bank only counts half.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {targets.map((player, index) => {
            const muddy = Boolean(player.halve_next_bank);
            return (
              <button
                key={player.id}
                type="button"
                disabled={muddy}
                onClick={() => onPick(player.player_index)}
                title={
                  muddy
                    ? "Their next bank is already halved"
                    : `${player.name}: ${player.total_score} points`
                }
                className="flex items-center gap-2.5 w-full text-left bg-[#ffffff10] border border-[#FFFFFF40] rounded-lg p-2 text-white duration-300 hover:border-[#ffffff80] hover:bg-[#ffffff20] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[#FFFFFF40] disabled:hover:bg-[#ffffff10]"
              >
                <figure className="w-[42px] h-[42px] shrink-0 bg-[#ffffff20] border border-[#FFFF8F40] rounded-md p-1 flex items-center justify-center">
                  <img src={player.avatar} alt="" className="max-h-full" />
                </figure>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold truncate">
                    {player.name}
                    {muddy ? (
                      <span
                        className="inline-flex items-center text-[10px] leading-none px-1.5 py-0.5 rounded-full border border-[#D30CBD80] bg-[#D30CBD20] text-[#F17E8C] align-middle ml-1"
                        aria-hidden="true"
                      >
                        {info.icon}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={`block text-[11px] ${
                      muddy ? "text-[#FFEA70]" : "text-[#ffffff99]"
                    }`}
                  >
                    {muddy ? "Already muddy" : `${player.total_score} points`}
                  </span>
                </span>
                <kbd className="text-[10px] leading-none font-mono px-1.5 py-1 rounded border border-[#ffffff60] border-b-2 bg-[#ffffff14] text-[#F9F7E8] shrink-0">
                  {index + 1}
                </kbd>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="w-full text-center rounded px-6 py-3 bg-[#ffffff10] border border-[#ffffff40] hover:bg-[#ffffff20] hover:border-[#ffffff80] duration-300 font-bold text-white"
        >
          Cancel{" "}
          <kbd className="text-[10px] leading-none font-mono px-1.5 py-1 rounded border border-[#ffffff60] border-b-2 bg-[#ffffff14] ml-1">
            Esc
          </kbd>
        </button>
      </div>
    </div>
  );
}