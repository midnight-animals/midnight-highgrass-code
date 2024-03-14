/**
 * 2
 */
export function getRandomFromInterval(min = 1, max = 2): number {
  const interim = max - min + 1;
  return Math.floor(Math.random() * interim + min);
}

// getRandomFromInterval(10); /*?*/

/**
[ 0.5438699643041487,
  0.8373182527274374,
  0.655293067078363 ]
 */
export function generateRandom<T = number>(
  min = 1,
  max = 2,
  // @ts-expect-error number type default
  callback: () => T = Math.random,
) {
  const num = getRandomFromInterval(min, max); // Generate a random number of circles between 0 and 10
  const result = Array.from({ length: num }, () => callback()); // Generate an array of random numbers
  return result;
}

// generateRandom(10); /*?*/

/**
 * [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
 */
export function generateIntSequence<T = number>(
  length = 10,
  // @ts-expect-error number type default
  callback: (i: number) => T = (i) => i,
) {
  const result = Array.from({ length }, (_, i) => callback(i));
  return result;
}

// generateIntSequence(); /*?*/

/**
 * [1,5]
 */
export function generateRandomInts(min = 1, max = 2) {
  const num = getRandomFromInterval(min, max); // Generate a random number of circles between 0 and 10
  const result = Array.from({ length: num }, () =>
    getRandomFromInterval(1, max),
  ); // Generate an array of random numbers
  return result;
}

// generateRandomInts(); /*?*/
// generateRandomInts(8, 10); /*?*/

/**
 * [ 4, 3, 10, 8, 4, 1, 6, 1, 5, 1 ]
 * [ 1, 5 ]
 */
export function getRandomElements<T>(arr: T[], n = arr.length): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result.slice(0, n);
}

// const rnds = generateRandomInts(8, 10); /*?*/
// getRandomElements(rnds, 2); /*?*/

/** FIXME Generated data overlaps */
export function generateCircles() {
  const numCircles = getRandomFromInterval(10); // Generate a random number of circles between 0 and 10
  const circles = Array.from({ length: numCircles }, () => Math.random()); // Generate an array of random numbers
  return circles;
}

// generateCircles(); /*?*/
