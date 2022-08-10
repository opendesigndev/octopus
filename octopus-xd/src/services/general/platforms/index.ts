import type { LoggerFactory } from '../logger/logger-factory.iface.js'

// Logger
type NodeLoggerFactory = () => LoggerFactory
type WebLoggerFactory = () => LoggerFactory

// Environment (Node only)
type NodeEnvironmentFactory = () => () => void

// Benchmark service
type NodeBenchmarkFactory = () => {
  benchmarkAsync: <T>(cb: (...args: unknown[]) => Promise<T>) => Promise<{ result: T; time: number }>
}
type WebBenchmarkFactory = () => {
  benchmarkAsync: <T>(cb: (...args: unknown[]) => Promise<T>) => Promise<{ result: T; time: number }>
}

// Node stack
export type NodeFactories = {
  createLoggerFactory: NodeLoggerFactory
  createEnvironment: NodeEnvironmentFactory
  createBenchmarkService: NodeBenchmarkFactory
}

// Web stack
export type WebFactories = {
  createLoggerFactory: WebLoggerFactory
  createBenchmarkService: WebBenchmarkFactory
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
