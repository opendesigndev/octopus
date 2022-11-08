export function filenameId(id: string): string {
  return String(id).replace(/[:;]/g, '-')
}
