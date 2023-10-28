import { createContext, useContext } from "react";

export const GreedyPigContext = createContext();

export function useGreedyPigContext() {
  const context = useContext(GreedyPigContext);
  return context;
}
