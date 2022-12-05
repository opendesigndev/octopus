export function isBase64(data: string): boolean {
  const regex = /^[a-zA-Z0-9+/]*={0,2}$/
  return regex.test(data)
}
