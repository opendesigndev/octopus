import crc32 from 'crc-32'

import { compare, isObject } from './common'

export function hashOf(value: unknown): string {
  const hash = crc32.str(JSON.stringify(value))
  const beautified = (hash - (1 << 31)).toString(16)
  return beautified
}

export function hashOfObjectSeed(seed: Array<[string, unknown]>): string {
  return hashOf(seed.slice().sort((a, b) => compare(String(a[0]), String(b[0]))))
}

export function hashOfArraySeed(seed: Array<unknown>): string {
  return hashOf(seed.slice())
}

export function hashArray(arr: Array<unknown>): string {
  return hashOfArraySeed(arr.map((value) => `hash(${hashAny(value)})`))
}

export function hashObject(obj: { [key: string]: unknown }): string {
  return hashOfObjectSeed(Object.entries(obj).map(([key, value]) => [key, hashAny(value)]))
}

export function hashAny(value: unknown): string {
  if (Array.isArray(value)) return hashArray(value)
  if (isObject(value)) return hashObject(value as Record<string, unknown>)
  return JSON.stringify(value)
}
