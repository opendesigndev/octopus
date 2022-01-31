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