import { useRef } from "react";

export default function useAudio(src, isLopping = false) {
  const audio = useRef(new Audio(src));
  return audio.current;
}
