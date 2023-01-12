export function notZero(n: number) {
  return n === 0 ? 0.001 : n
}

export function stringify(value: unknown) {
  return JSON.stringify(value, null, '  ')
}

export function isEmptyObj(obj: { [key: string]: unknown }): boolean {
  return Object.values(obj).every((value) => value === undefined)
}
