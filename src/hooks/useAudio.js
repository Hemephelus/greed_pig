import { useRef } from "react";
import { usePlayerDataContext } from "../context/usePlayerDataContext";

export default function useAudio(src) {
  const { preloadSrcList, setPlayerData, playerData } = usePlayerDataContext();
  // if (isAudioOn !== true) return;

  const audio = useRef(new Audio(src));
  return audio.current;
}
