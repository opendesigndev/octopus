export function benchmark<T>(cb: (...args: unknown[]) => T): { result: T; time: number } {
  const start = performance.now()
  const result = cb()
  const time = performance.now() - start
  return { result, time }
}

export async function benchmarkAsync<T>(cb: (...args: unknown[]) => Promise<T>): Promise<{ result: T; time: number }> {
  const start = performance.now()
  const result = await cb()
  const time = performance.now() - start
  return { result, time }
}
