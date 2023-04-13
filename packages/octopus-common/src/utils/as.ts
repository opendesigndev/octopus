import { isFiniteNumber } from './common'

type AsArray<T> = T extends unknown[] ? T : never

export function asArray<T, U>(value: T, defaultValue?: U): AsArray<T> | AsArray<U> {
  if (Array.isArray(value)) {
    return value as AsArray<T>
  }
  if (Array.isArray(defaultValue)) {
    return defaultValue as AsArray<U>
  }
  return [] as unknown as AsArray<T>
}

export function asBoolean(value: unknown, defaultValue?: boolean): boolean {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof defaultValue === 'boolean') {
    return defaultValue
  }
  return Boolean(value)
}

export function asString(value: unknown, defaultValue?: string): string {
  if (typeof value === 'string') {
    return value
  }
  if (typeof defaultValue === 'string') {
    return defaultValue
  }
  return String(value)
}

export function asNumber(value: unknown, defaultValue?: number): number {
  if (typeof value === 'number') {
    return value
  }
  if (typeof defaultValue === 'number') {
    return defaultValue
  }
  return Number(value)
}

function isWrongZero(value: unknown): boolean {
  // Number(null) === 0
  // Number('') === 0
  // Number('   ') === 0
  return value === null || (typeof value === 'string' && value.trim() === '')
}

export function asFiniteNumber(value: unknown, defaultValue?: number): number {
  if (isFiniteNumber(value)) return value
  const conversionAttempt = Number(value)
  if (isFiniteNumber(conversionAttempt) && !isWrongZero(value)) return conversionAttempt
  if (isFiniteNumber(defaultValue)) return defaultValue
  throw new Error(`Failed when converting "${value}" to finite number.`)
}
