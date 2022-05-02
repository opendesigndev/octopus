export type DetachedPromiseControls<T> = {
  promise: Promise<T>
  resolve: (value?: unknown) => T
  reject: (value?: unknown) => Error
}

export function detachPromiseControls<T>(): DetachedPromiseControls<T> {
  let resolver
  let rejecter
  const promise = new Promise<T>((resolve, reject) => {
    resolver = resolve
    rejecter = reject
  })
  return {
    promise,
    resolve: resolver as unknown as () => T,
    reject: rejecter as unknown as () => Error,
  }
}

export function rejectTo<T>(promise: Promise<T>): Promise<T | null>
export function rejectTo<T, U>(promise: Promise<T>, errValue: U): Promise<T | U>
export function rejectTo<T, U>(promise: Promise<T>, errValue: U | null = null): Promise<T | U | null> {
  return promise.then(
    (value) => value,
    () => errValue
  )
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
