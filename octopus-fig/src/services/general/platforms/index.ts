import type { ImageSize } from '../image-size/image-size'
import type { LoggerFactory } from '../logger/logger-factory'

// Logger
type NodeLoggerFactory = LoggerFactory
type WebLoggerFactory = LoggerFactory

// Environment (Node only)
type NodeEnvironmentFactory = () => void

// Benchmark service
type NodeBenchmarkFactory = () => {
  benchmarkAsync: <T>(cb: (...args: unknown[]) => Promise<T>) => Promise<{ result: T; time: number }>
}
type WebBenchmarkFactory = () => {
  benchmarkAsync: <T>(cb: (...args: unknown[]) => Promise<T>) => Promise<{ result: T; time: number }>
}

// ImageSize service
type NodeImageSizeFactory = () => (buffer: ArrayBuffer) => Promise<ImageSize | undefined>
type WebImageSizeFactory = () => (buffer: ArrayBuffer) => Promise<ImageSize | undefined>

// Node stack
export type NodeFactories = {
  createLoggerFactory: NodeLoggerFactory
  createEnvironment: NodeEnvironmentFactory
  createBenchmarkService: NodeBenchmarkFactory
  createImageSizeService: NodeImageSizeFactory
}

// Web stack
export type WebFactories = {
  createLoggerFactory: WebLoggerFactory
  createBenchmarkService: WebBenchmarkFactory
  createImageSizeService: WebImageSizeFactory
}

let factories: NodeFactories | WebFactories

export function setPlatformFactories(factoriesArg: NodeFactories | WebFactories): void {
  factories = factoriesArg
}

export function getPlatformFactories<T extends NodeFactories | WebFactories>(): T {
  if (!factories) {
    throw new Error('Platform specific factories are not set!')
  }
  return factories as unknown as T
}
