import type { BenchmarkServiceFactory } from '../benchmark-service/benchmark-service-factory.js'
import type { Env } from '../environment/index.js'
import type { LoggerFactory } from '../logger/logger-factory.js'

// Logger
type NodeLoggerFactory = LoggerFactory
type WebLoggerFactory = LoggerFactory

// Environment (Node only)
type NodeEnvironmentFactory = () => Env

// Benchmark service
type NodeBenchmarkFactory = BenchmarkServiceFactory
type WebBenchmarkFactory = BenchmarkServiceFactory

// Node stack
export type NodeFactories = {
  createLoggerFactory: NodeLoggerFactory
  createBenchmarkService: NodeBenchmarkFactory
  createEnvironment: NodeEnvironmentFactory
}

// Web stack
export type WebFactories = {
  createLoggerFactory: WebLoggerFactory
  createBenchmarkService: WebBenchmarkFactory
  createEnvironment: undefined
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
