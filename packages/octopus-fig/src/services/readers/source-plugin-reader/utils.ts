import type { RawTransform } from '../../../typings/raw'

export function isBase64(data: string): boolean {
  const regex = /^[a-zA-Z0-9+/]*={0,2}$/
  return regex.test(data)
}

export function convertToRawTransform([a, b, c, d, tx, ty]: number[]): RawTransform {
  return [
    [a, c, tx],
    [b, d, ty],
  ]
}
