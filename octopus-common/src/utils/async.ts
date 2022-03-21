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

export async function benchmark<T>(cb: () => Promise<T>): Promise<{ time: number; result: T }> {
  const timeStart = performance.now()
  const result = await cb()
  return { result, time: performance.now() - timeStart }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
