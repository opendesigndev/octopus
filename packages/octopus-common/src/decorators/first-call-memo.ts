function memoizeFirstCall<T extends [], U>(fn: (...args: T) => U) {
  const results = new WeakMap<Record<string, unknown>, U>()
  return function (...args: T) {
    if (!results.has(this)) {
      results.set(this, fn.call(this, ...args))
    }
    return results.get(this)
  }
}

/**
 * Decorator for methods/getter which saves first call result and returns it on every next call.
 */
export function firstCallMemo() {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    if (descriptor.get) descriptor.get = memoizeFirstCall(descriptor.get)
    if (descriptor.value) descriptor.value = memoizeFirstCall(descriptor.value)
    return descriptor
  }
}
