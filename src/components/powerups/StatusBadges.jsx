/* eslint-disable react/prop-types */
import { POWERUP_TYPES } from "src/constants/game";
import { POWERUP_INFO } from "src/constants/powerups";

const CHIP =
  "inline-flex items-center gap-1 text-[10px] leading-none px-1.5 py-0.5 rounded-full border align-middle ml-1";

// Small chips beside a player's name: Mud Bath armed, next bank halved, and how
// many power-ups they hold. A player with nothing to show gets nothing.
export default function StatusBadges({ player }) {
  if (!player) return null;

  const held = player.powerups?.length ?? 0;
  const mudBath = Boolean(player.mud_bath_active);
  const halved = Boolean(player.halve_next_bank);

  if (!mudBath && !halved && held === 0) return null;

  const mudInfo = POWERUP_INFO[POWERUP_TYPES.MUD_BATH];
  const trottersInfo = POWERUP_INFO[POWERUP_TYPES.MUDDY_TROTTERS];

  return (
    <>
      {mudBath ? (
        <span
          className={`${CHIP} border-[#8b5a2b80] bg-[#8b5a2b20] text-[#d6a06a]`}
          title={`Mud Bath ready: ${mudInfo.description}`}
        >
          <span aria-hidden="true">{mudInfo.icon}</span>
          <span className="sr-only">Mud Bath ready</span>
        </span>
      ) : null}

      {halved ? (
        <span
          className={`${CHIP} border-[#D30CBD80] bg-[#D30CBD20] text-[#F17E8C]`}
          title={`Next bank halved: ${trottersInfo.description}`}
        >
          <span aria-hidden="true">{trottersInfo.icon}</span>
          <span className="sr-only">Next bank halved</span>
        </span>
      ) : null}

      {held > 0 ? (
        <span
          className={`${CHIP} border-[#FFFFFF40] bg-[#ffffff10] text-[#F9F7E8]`}
          title={`${held} power-up${held === 1 ? "" : "s"} held`}
        >
          {held}
        </span>
      ) : null}
    </>
  );
}