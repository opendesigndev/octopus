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

export function isObject(anyValue: unknown): anyValue is object {
  return Boolean(anyValue && (typeof anyValue === 'object' || typeof anyValue === 'function'))
}

export function getMapped<T, U>(value: unknown, map: { [key: string]: T }, defaultValue: U): T | U {
  if (typeof value !== 'string') return defaultValue
  return value && value in map ? map[value] : defaultValue
}

export function getPresentProps<T, U>(obj: T, skipValues: U[] = []): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => {
      return value !== null && value !== undefined && !skipValues.includes(value)
    })
  ) as Partial<T>
}

export function getConverted<T extends { convert: () => unknown }>(
  entities: T[]
): Exclude<ReturnType<T['convert']>, null>[] {
  return entities
    .map((entity) => {
      return entity.convert()
    })
    .filter((converted) => {
      return converted
    }) as Exclude<ReturnType<T['convert']>, null>[]
}
