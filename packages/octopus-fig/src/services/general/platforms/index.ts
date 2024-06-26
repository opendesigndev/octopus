import type { BufferFactory } from '../buffer/buffer-factory.js'
import type { Env } from '../environment/index.js'
import type { ImageSize } from '../image-size/image-size.js'
import type { LoggerFactory } from '../logger/logger-factory.js'

// Logger
type NodeLoggerFactory = LoggerFactory
type WebLoggerFactory = LoggerFactory

// Environment (Node only)
type NodeEnvironmentFactory = () => Env

// Benchmark service
type NodeBenchmarkFactory = () => {
  benchmarkAsync: <T>(cb: (...args: unknown[]) => Promise<T>) => Promise<{ result: T; time: number }>
}
type WebBenchmarkFactory = () => {
  benchmarkAsync: <T>(cb: (...args: unknown[]) => Promise<T>) => Promise<{ result: T; time: number }>
}

// ImageSize service
export type ImageSizeService = (buffer: ArrayBuffer) => Promise<ImageSize | undefined>
type ImageSizeFactory = () => ImageSizeService

// Buffer service
type NodeBufferFactory = BufferFactory
type WebBufferFactory = BufferFactory

// Node stack
export type NodeFactories = {
  createLoggerFactory: NodeLoggerFactory
  createBenchmarkService: NodeBenchmarkFactory
  createImageSizeService: ImageSizeFactory
  createBufferService: NodeBufferFactory
  createEnvironment: NodeEnvironmentFactory
}

// Web stack
export type WebFactories = {
  createLoggerFactory: WebLoggerFactory
  createBenchmarkService: WebBenchmarkFactory
  createImageSizeService: ImageSizeFactory
  createBufferService: WebBufferFactory
  createEnvironment: null
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
