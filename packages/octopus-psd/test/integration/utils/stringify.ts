// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stringify(value: any): string {
  return JSON.stringify(value, null, 2)
}
