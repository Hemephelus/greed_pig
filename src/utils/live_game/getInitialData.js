import { generateId, getRandomIntegersBetween } from "../generateData";

export function getInitialPlayerData() {
  const MIN_PLAYERS = 2;
  const arr = [];

  for (let i = 0; i < MIN_PLAYERS; i++) {
    const id = generateId();
    arr[i] = {
      id: id,
      avatar: `/src/assets/pig-${i}.png`,
      tag: `Player ${id.split('-')[1]}`,
      name: "",
      pig_index: i,
      running_points: 0,
      total_points: 0,
    };
  }
  return arr;
}