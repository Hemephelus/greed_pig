/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { useGameSession, PHASE } from "src/context/GameSessionContext";
import { POWERUP_TYPES } from "src/constants/game";
import {
  MAX_POWERUPS_HELD,
  POWERUP_INFO,
  POWERUP_SHORTCUT_KEYS,
} from "src/constants/powerups";
import { getTargets } from "src/state/selectors";
import TargetPickerDialog from "./TargetPickerDialog";

// Why this slot can't be clicked right now. null means it can.
// Order matters: the most general reason wins.
function blockedReason({ powerup, activePlayer, session, phase, isBusy, locked }) {
  if (phase !== PHASE.PLAYING) return "Game over";
  if (locked) return `${activePlayer.name} is playing`;
  if (isBusy) return "Waiting for the server";
  if (session?.powerup_used_this_turn) return "1 per turn: used";
  if (powerup.type === POWERUP_TYPES.PIGGY_BANK && activePlayer.turn_score < 2) {
    return "Nothing to bank yet";
  }
  if (powerup.type === POWERUP_TYPES.MUD_BATH && activePlayer.mud_bath_active) {
    return "Already in the mud";
  }
  return null;
}

// The active player's power-up slots, under the die.
// variant "stack" is the desktop column, "row" is the mobile strip.
// onOpenChange(isOpen) fires when the target picker opens or closes, so the
// game's keyboard shortcuts can pause while it is up (K2).
export default function PowerUpTray({ locked = false, onOpenChange, variant = "stack" }) {
  const { activePlayer, players, session, phase, isBusy, activatePowerup } =
    useGameSession();
  const inFlight = useRef(false);
  // The Muddy Trotters waiting for a target, or null
  const [pending, setPending] = useState(null);

  useEffect(() => {
    onOpenChange?.(Boolean(pending));
  }, [pending, onOpenChange]);

  // Close the picker if the turn moves on while it is open
  useEffect(() => {
    if (pending && (locked || phase !== PHASE.PLAYING)) setPending(null);
  }, [pending, locked, phase]);

  if (!activePlayer) return null;

  const held = (activePlayer.powerups ?? []).slice(0, MAX_POWERUPS_HELD);
  // Always MAX_POWERUPS_HELD slots, so the tray doesn't jump around
  const slots = Array.from({ length: MAX_POWERUPS_HELD }, (_, i) => held[i] ?? null);
  const isRow = variant === "row";

  async function use(powerupId, targetIndex) {
    if (inFlight.current) return;
    inFlight.current = true;
    await activatePowerup({ powerupId, targetIndex });
    inFlight.current = false;
  }

  function handleClick(powerup) {
    if (inFlight.current) return;
    const info = POWERUP_INFO[powerup.type];
    if (info?.needsTarget) {
      setPending(powerup);
      return;
    }
    use(powerup.id);
  }

  async function handlePick(targetIndex) {
    const powerup = pending;
    setPending(null);
    if (powerup) await use(powerup.id, targetIndex);
  }

  return (
    <>
      <div className={`w-full ${isRow ? "grid grid-cols-3 gap-2" : "flex flex-col gap-2"}`}>
        {slots.map((powerup, index) => {
          const shortcutKey = POWERUP_SHORTCUT_KEYS[index];

          if (!powerup) {
            return (
              <div
                key={`empty-${index}`}
                className={`border border-dashed border-[#ffffff30] rounded-lg text-[#ffffff60] ${
                  isRow
                    ? "flex flex-col items-center justify-center text-center gap-1 py-2 px-1 text-[9px] leading-tight"
                    : "flex items-center gap-2 p-2 text-[10px]"
                }`}
              >
                {isRow ? <span className="text-base opacity-40">+</span> : null}
                <span>{isRow ? "Bust with 10+" : "Bust with 10+ points to earn one"}</span>
              </div>
            );
          }

          const info = POWERUP_INFO[powerup.type] ?? {};
          const reason = blockedReason({
            powerup,
            activePlayer,
            session,
            phase,
            isBusy,
            locked,
          });

          return (
            <button
              key={powerup.id}
              type="button"
              onClick={() => handleClick(powerup)}
              data-shortcut={`powerup-${index + 1}`}
              disabled={Boolean(reason)}
              title={reason ?? info.description}
              className={`bg-[#ffffff10] border border-[#FFFFFF40] rounded-lg duration-300 text-white hover:border-[#ffffff80] hover:bg-[#ffffff20] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[#FFFFFF40] disabled:hover:bg-[#ffffff10] ${
                isRow
                  ? "flex flex-col items-center text-center gap-1 py-2 px-1"
                  : "flex items-center gap-2 w-full text-left p-2"
              }`}
            >
              <span className="text-[22px] leading-none shrink-0" aria-hidden="true">
                {info.icon}
              </span>
              {isRow ? (
                <span className="text-[10px] font-bold leading-tight">{info.label}</span>
              ) : (
                <span className="flex-1 min-w-0">
                  <span className="block text-xs font-bold">{info.label}</span>
                  <span
                    className={`block text-[10px] ${
                      reason ? "text-[#FFEA70]" : "text-[#ffffff99]"
                    }`}
                  >
                    {reason ?? info.shortText}
                  </span>
                </span>
              )}
              <kbd className="text-[10px] leading-none font-mono px-1.5 py-1 rounded border border-[#ffffff60] border-b-2 bg-[#ffffff14] text-[#F9F7E8] shrink-0">
                {shortcutKey}
              </kbd>
            </button>
          );
        })}
      </div>

      {pending ? (
        <TargetPickerDialog
          targets={getTargets(players, activePlayer)}
          onPick={handlePick}
          onCancel={() => setPending(null)}
        />
      ) : null}
    </>
  );
}