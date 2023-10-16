import { useRef } from "react";

export default function useAudio(src) {
    const audio = useRef(new Audio(src));
  return audio.current;
}
