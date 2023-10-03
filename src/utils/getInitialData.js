import { generateId, getRandomIntegersBetween } from "./generateData";

export function getInitialPlayerData() {
  const MIN_PLAYERS = 2;
  const obj = {};

  for (let i = 0; i < MIN_PLAYERS; i++) {
    const id = generateId();
    const index = getRandomIntegersBetween(0, 8)
    obj[id] = {
      id: id,
      avatar: `/src/assets/pig-${index}.png`,
      tag: `Player ${id.split('-')[1]}`,
      name: "",
      pig_index: index,
      running_points: 0,
      total_points: 0,
      is_turn: true,
    };
  }
  return obj;
}

let a = {
  max_score : 0,
  number_of_players: 2,  
  current_dice: 1,

}

