import { useRef } from "react";

export default function useAudio(src) {
    console.log('1');
    const audio = useRef(new Audio(src));
    console.log('2');
//   audio.current.loop = true;
//   console.log(audio.current.loop);
  return audio.current;
}
