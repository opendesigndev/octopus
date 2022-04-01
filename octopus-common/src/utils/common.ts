import isObjectLike from 'lodash/isObjectLike'
import util from 'util'

export function JSONFromTypedArray(typedArray: Uint8Array): unknown {
  return JSON.parse(Buffer.from(typedArray).toString())
}

export function deepInspect(value: unknown): string {
  return util.inspect(value, { depth: null })
}

export function isObject(anyValue: unknown): anyValue is Record<string, unknown> {
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

// eslint-disable-next-line @typescript-eslint/ban-types
function _traverseAndFindRecursive<T>(node: unknown, cb: Function): T[] {
  return [
    cb(node),
    ...Object.values(node as Record<string, unknown>).reduce<T[]>((results, value) => {
      if (!isObjectLike(value)) return results
      return [...results, ..._traverseAndFindRecursive<T>(value, cb)]
    }, []),
  ]
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function traverseAndFind<T>(node: Record<string, unknown>, cb: Function): T[] {
  return _traverseAndFindRecursive<T>(node, cb).filter((result) => result !== undefined)
}

export function keys<T extends Record<string | number | symbol, unknown>>(obj: T): (keyof T)[] {
  return Object.keys(obj)
}

export function push<T, U>(arr: (T | U)[], ...values: U[]): (T | U)[] {
  arr.push(...values)
  return arr
}
