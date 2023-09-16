export function generateId() {
  return (Math.random() * 1000000 + Date.now()).toString(16).replace(".", "-");
}

export function getRandomIntegersBetween(min, max) {
  // Generate a random number between 0 and 1.
  let randomNumber = Math.random();

  // Multiply the random number by the range.
  randomNumber = randomNumber * (max - min);

  // Add the minimum value to the random number.
  return Math.floor(randomNumber + min);
}
