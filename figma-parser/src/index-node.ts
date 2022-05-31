import { Parser } from './parser'
import BenchmarkHTTPRequestNode from './services/benchmarks-tracker/node/benchmark-http-request-node'
import BenchmarkSimpleNode from './services/benchmarks-tracker/node/benchmark-simple-node'
import BenchmarksTrackerNode from './services/benchmarks-tracker/node/benchmarks-tracker-node'
import { DownloaderNode } from './services/downloader/node/downloader-node'
import { createEnvironmentNode } from './services/environment'
import { createLoggerNode } from './services/logger/node/logger-node'
import { createSentryNode } from './services/sentry/node/sentry-node'

import type { ParserOptions } from './parser'
import type { NodeFactories } from './services/platforms'

export function createParser(options: Omit<ParserOptions, 'platformFactories'>): Parser {
  return new Parser({
    ...options,
    platformFactories: {
      createDownloader: (options) => new DownloaderNode(options),
      createBenchmarkHTTPRequest: (request) => new BenchmarkHTTPRequestNode(request),
      createBenchmarkSimple: (label) => new BenchmarkSimpleNode(label),
      createBenchmarksTracker: () => new BenchmarksTrackerNode(),
      createLoggerFactory: () => createLoggerNode,
      createSentryFactory: () => createSentryNode,
      createEnvironment: () => createEnvironmentNode,
    } as NodeFactories,
  })
}
