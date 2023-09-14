import { generateId } from "./generateData";

export function getInitialPlayerData() {
  const MIN_PLAYERS = 2;
  const obj = {};

  for (let i = 0; i < MIN_PLAYERS; i++) {
    const id = generateId();

    obj[id] = {
      id: id,
      avatar: "",
      tag: `Player ${id.split('-')[1]}`,
      name: "",
      running_points: 0,
      total_points: 0,
      is_turn: true,
    };
  }
  return obj;
}
