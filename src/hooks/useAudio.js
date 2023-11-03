import { useRef } from "react";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";

export default function useAudio(src) {
  const {  hasSound } = useGreedyPigContext();
  const audio = useRef(new Audio(src));
  if(!hasSound) return 
  return audio.current;
}
