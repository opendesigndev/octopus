function memoizeFirstCall<T extends [], U>(fn: (...args: T) => U) {
  let results = new WeakMap<any, U>()
  return function(...args: T) {
    if (!results.has(this)) {
      results.set(this, fn.call(this, ...args))
    }
    return results.get(this)
  }
}

/**
 * Decorator for methods/getter which saves first call result and returns it on every next call.
 */
export default function firstCallMemo() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    if (descriptor.get) descriptor.get = memoizeFirstCall(descriptor.get)
    if (descriptor.value) descriptor.value = memoizeFirstCall(descriptor.value)
    return descriptor
  }
}