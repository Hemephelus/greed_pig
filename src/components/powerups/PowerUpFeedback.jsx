/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useGameSession } from "src/context/GameSessionContext";
import { POWERUP_TYPES } from "src/constants/game";
import { POWERUP_INFO } from "src/constants/powerups";

// How long a one-off highlight stays on screen
const FLASH_MS = 4000;

// Shows `value` for FLASH_MS after it changes, then hides it. A new value
// (compared with `key`) shows it again, so each event is seen exactly once.
function useFlash(key, value) {
  const [shown, setShown] = useState(null);

  useEffect(() => {
    if (key === null || key === undefined) {
      setShown(null);
      return undefined;
    }
    setShown(value);
    const t = setTimeout(() => setShown(null), FLASH_MS);
    return () => clearTimeout(t);
    // `value` is derived from `key`; re-running on key alone is intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return shown;
}

const PILL =
  "sec-font flex items-center gap-2 w-full rounded-lg border px-3 py-2 text-xs leading-snug";

// Small visual extras under the power-up tray (PF5). The server message stays
// the main text; these only make the power-up events easy to spot:
//   - a Comeback power-up was earned on a bust
//   - a Truffle Sniff answer is waiting (stays until the next roll)
//   - Muddy Trotters halved a bank
export default function PowerUpFeedback() {
  const { lastPowerupEarned, lastBank, sniffResult, players } = useGameSession();

  const earned = useFlash(lastPowerupEarned?.id ?? null, lastPowerupEarned);
  // A bust passes the turn, so the tray on screen is the next player's.
  // Name the earner: the player whose tray the new power-up landed in.
  const earner = earned
    ? players.find((p) => p.powerups?.some((pu) => pu.id === earned.id))
    : null;
  const halved = useFlash(lastBank?.halved ? lastBank : null, lastBank);

  const sniffInfo = POWERUP_INFO[POWERUP_TYPES.TRUFFLE_SNIFF];
  const trottersInfo = POWERUP_INFO[POWERUP_TYPES.MUDDY_TROTTERS];

  if (!earned && !sniffResult && !halved) return null;

  return (
    <div className="flex w-full flex-col gap-1" aria-live="polite">
      {earned ? (
        <p
          className={`${PILL} animate-pulse border-[#FFD700a0] bg-[#FFD70020] text-[#FFEA70]`}
          data-testid="feedback-earned"
        >
          <span aria-hidden="true">✨</span>
          <span>
            Comeback! {earner ? `${earner.name} earned` : "Earned"} a{" "}
            <b>
              {POWERUP_INFO[earned.type]?.label ?? earned.type}{" "}
              {POWERUP_INFO[earned.type]?.icon}
            </b>
          </span>
        </p>
      ) : null}

      {sniffResult ? (
        <p
          className={`${PILL} ${
            sniffResult.nextRollIsOne
              ? "border-[#E71D36a0] bg-[#E71D3620] text-[#F17E8C]"
              : "border-[#2ECC71a0] bg-[#2ECC7120] text-[#8CF1B0]"
          }`}
          data-testid="feedback-sniff"
        >
          <span aria-hidden="true">{sniffInfo.icon}</span>
          <span>
            {sniffResult.nextRollIsOne ? (
              <>
                Next roll is a <b>1</b>. Bank now!
              </>
            ) : (
              <>
                Next roll is <b>safe</b>.
              </>
            )}
          </span>
        </p>
      ) : null}

      {halved ? (
        <p
          className={`${PILL} border-[#D30CBDa0] bg-[#D30CBD20] text-[#F17E8C]`}
          data-testid="feedback-halved"
        >
          <span aria-hidden="true">{trottersInfo.icon}</span>
          <span>
            Muddy trotters: only <b>½</b> banked, lost {halved.lost_to_mud}.
          </span>
        </p>
      ) : null}
    </div>
  );
}
