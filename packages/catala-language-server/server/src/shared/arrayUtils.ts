// merge two arrays of strings
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export function mergeArrays<T extends any>(arr1: T[], arr2: T[]): T[] {
  return Array.from(new Set([...(arr1 ?? []), ...(arr2 ?? [])]));
}
