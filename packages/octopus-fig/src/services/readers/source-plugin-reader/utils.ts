export function isBase64(data: string): boolean {
  const regex = /^[a-zA-Z0-9+/]*={0,2}$/ // https://stackoverflow.com/a/475217
  return Boolean(data) && regex.test(data)
}
