import { generateId } from "../generateData";

export function getInitialPlayerData(pigs, pigNames) {
  const MIN_PLAYERS = 2;
  const arr = [];

  for (let i = 0; i < MIN_PLAYERS; i++) {
    const id = generateId();
    arr[i] = {
      id: id,
      avatar: pigs[i],
      tag: pigNames[i],
      name: "",
      pig_index: i,
      running_points: 0,
      total_points: 0,
    };
  }
  return arr;
}