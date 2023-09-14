import { createContext, useContext } from "react";

export const playerDataContext = createContext();

export function usePlayerDataContext() {
  const context = useContext(playerDataContext);
  return context;
}
