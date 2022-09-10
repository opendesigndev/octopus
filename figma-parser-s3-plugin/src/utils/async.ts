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

export async function seq<T, U>(tasks: T[], factory: (task: T) => Promise<U>): Promise<U[]> {
  return tasks.reduce<Promise<U[]>>(async (queue, task) => {
    const results = await queue
    const result: U = await factory(task)
    results.push(result)
    return results
  }, Promise.resolve([]))
}
