/* eslint-disable no-control-regex */
export function normalizeTextValue(value: unknown): string {
  return String(value)
    .replace(/\u0003/g, '\u2028') // \u2028: Line Separator
    .replace(/\r/g, '\u2029') // \u2029: Paragraph Separator
    .replace(/\n/g, '\u2029')
}
