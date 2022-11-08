export function timestamp(): string {
  return new Date().toISOString().slice(2, 19).replace(/[-:]/g, '').replace('T', '-')
}
