// copy from octupus xd
export function stringify(value: unknown): string {
  return JSON.stringify(value, null, '  ')
}
