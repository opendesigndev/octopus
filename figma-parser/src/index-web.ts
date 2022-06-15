import { Parser } from './parser'
import BenchmarksTrackerWeb from './services/benchmarks-tracker/web/benchmarks-tracker-web'
import { DownloaderWeb } from './services/downloader/web/downloader-web'
import { createLoggerWeb } from './services/logger/web/logger-web'
import { createSentryWeb } from './services/sentry/web/sentry-web'

import type { ParserOptions } from './parser'
import type { WebFactories } from './services/platforms'

export function createParser(options: Omit<ParserOptions, 'platformFactories'>): Parser {
  return new Parser({
    ...options,
    platformFactories: {
      createDownloader: (options) => new DownloaderWeb(options),
      createBenchmarksTracker: () => new BenchmarksTrackerWeb(),
      createLoggerFactory: () => createLoggerWeb,
      createSentryFactory: () => createSentryWeb,
    } as WebFactories,
  })
}
