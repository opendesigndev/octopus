import pick from 'lodash/pick'
import { default as wo } from 'lodash/without'

export function isObject(anyValue: unknown): anyValue is Record<string, unknown> {
  return Boolean(anyValue && (typeof anyValue === 'object' || typeof anyValue === 'function'))
}

export function keys<T extends Record<PropertyKey, unknown>>(obj: T): Exclude<keyof T, number | symbol>[] {
  return Object.keys(obj) as unknown as Exclude<keyof T, number | symbol>[]
}

export function without<T extends Record<PropertyKey, unknown>, U extends readonly string[]>(
  obj: T,
  withoutProps: U
): Omit<T, U[number]> {
  return pick(obj, wo(keys(obj), ...withoutProps)) as Omit<T, U[number]>
}
