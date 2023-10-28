import { createContext, useContext } from "react";

export const LiveGameContext = createContext();

export function useLiveGameContext() {
  const context = useContext(LiveGameContext);
  return context;
}
