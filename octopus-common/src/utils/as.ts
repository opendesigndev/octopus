type AsArray<T> = T extends any[] ? T : never

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

export function asFiniteNumber(value: unknown, defaultValue?: number): number {
  if (typeof value === 'number') {
    return value
  }
  if (typeof defaultValue === 'number') {
    return defaultValue
  }
  const conversionAttempt = Number(value)
  if (!Number.isInteger(conversionAttempt)) {
    throw new Error(`Failed when converting "${value}" to finite number`)
  }
  return conversionAttempt
}
