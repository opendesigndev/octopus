export function notZero(n: number) {
  return n === 0 ? 0.001 : n
}

export function stringify(value: unknown) {
  return JSON.stringify(value, null, '  ')
}
