import util from 'util'


export function JSONFromTypedArray(typedArray: Uint8Array) {
  return JSON.parse(Buffer.from(typedArray).toString())
}

export function deepInspect(value: any) {
  return util.inspect(value, { depth: null })
}

export function round(n: number, precision = 2) {
  const multiplier = Math.pow(10, precision)
  return Math.round(n * multiplier) / multiplier
}