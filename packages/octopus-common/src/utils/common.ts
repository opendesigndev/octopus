import util from 'util'

import isObjectLike from 'lodash/isObjectLike'

import type { GetPromiseValue } from './utility-types'

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
  return entities.map((entity) => entity.convert()).filter((converted) => Boolean(converted)) as Exclude<
    ReturnType<T['convert']>,
    null
  >[]
}

type ConvertedLayer<T, U extends { convert: () => Promise<T> }> = Exclude<
  GetPromiseValue<ReturnType<U['convert']>>,
  null
>

export async function getConvertedAsync<T, U extends { convert: () => Promise<T> }>(
  entities: U[]
): Promise<ConvertedLayer<T, U>[]> {
  const converted = await Promise.all(entities.map((entity) => entity.convert()))
  return converted.filter((converted) => Boolean(converted)) as ConvertedLayer<T, U>[]
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

/** language-sensitive string compare function for array sort */
export const compare = (() => {
  const collator = new Intl.Collator('en-US')
  return (a: string, b: string) => collator.compare(a, b)
})()
