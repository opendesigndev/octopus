export function timestamp(): string {
  // YYMMDD-HHmmss
  return new Date().toISOString().slice(2, 19).replace(/[-:]/g, '').replace('T', '-')
}
