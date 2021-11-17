export function stringify(value: any): string {
  return JSON.stringify(value, null, '  ')
}