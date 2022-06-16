import type { Parser } from '../../parser'
import type { IBenchmarksTracker } from '../benchmarks-tracker/benchmarks-tracker.iface'
import type { IDownloader } from '../downloader/downloader.iface'
import type { LoggerFactory } from '../logger/logger-factory.iface'
import type { SentryFactory } from '../sentry/sentry-factory.iface'

// Downloader
type NodeDownloaderFactory = (options: { parser: Parser }) => IDownloader
type WebDownloaderFactory = (options: { parser: Parser }) => IDownloader

// Benchmarks Tracker
type NodeBenchmarksTrackerFactory = () => IBenchmarksTracker
type WebBenchmarksTrackerFactory = () => IBenchmarksTracker

// Logger
type NodeLoggerFactory = () => LoggerFactory
type WebLoggerFactory = () => LoggerFactory

// Sentry
type NodeSentryFactory = () => SentryFactory
type WebSentryFactory = () => SentryFactory

// Environment (Node only)
type NodeEnvironmentFactory = () => () => void

// Node stack
export type NodeFactories = {
  createDownloader: NodeDownloaderFactory
  createBenchmarksTracker: NodeBenchmarksTrackerFactory
  createLoggerFactory: NodeLoggerFactory
  createSentryFactory: NodeSentryFactory
  createEnvironment: NodeEnvironmentFactory
}

// Web stack
export type WebFactories = {
  createDownloader: WebDownloaderFactory
  createBenchmarksTracker: WebBenchmarksTrackerFactory
  createLoggerFactory: WebLoggerFactory
  createSentryFactory: WebSentryFactory
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