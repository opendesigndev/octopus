export type BenchMarkService = <T>(cb: (...args: unknown[]) => T) => { result: T; time: number }
