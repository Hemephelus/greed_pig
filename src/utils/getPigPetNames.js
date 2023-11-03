export function getPigPetNames() {
    const array = [//
        "Bacon",
        "Betsy",
        "Chubby",
        "Briar",
        "Brutus",
        "Buttercup",
        "Charlotte",
        "Clover",
        "Curly",
        "Daisy",
        "Delilah",
        "Duchess",
        "Ellie",
        "Esmeralda",
        "Fatty",
        "Figaro",
        "Fiona",
        "Floyd",
        "Frankie",
        "Freckles",
        "Ginger",
        "Ham",
        "Hank",
        "Harley",
        "Hazel",
        "Henry",
        "Honey",
        "Houdini",
        "Iggy",
        "Jasper",
        "Jill",
        "Joey",
        "Kevin",
        "Lulu",
        "Mabel",
        "Maggie",
        "Marley",
        "Matilda",
        "Maxwell",
        "Molly",
        "Moo",
        "Morty",
        "Mudpuddle",
        "Oliver",
        "Oreo",
        "Penelope",
        "Pickles",
        "Piggy",
        "Pinky",
        "Porkchop",
        "Priscilla",
        "Pumpkin",
        "Rosie",
        "Ruby",
        "Sam",
        "Sandy",
        "Squealer",
        "Sugar",
        "Wilbur",
        "Winnie",
        "Winston",
        "Woody",
        "Ziggy"
      ];
    // Create a copy of the array.
    const shuffledArray = array.slice();
  
    // Loop over the array and swap each element with a random element.
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * i);
      const temp = shuffledArray[i];
      shuffledArray[i] = shuffledArray[randomIndex];
      shuffledArray[randomIndex] = temp;
    }
  
    // Return the shuffled array.
    return shuffledArray;
  }
  