import { Parser } from './parser.js'
import BenchmarksTrackerWeb from './services/benchmarks-tracker/web/benchmarks-tracker-web.js'
import { DownloaderWeb } from './services/downloader/web/downloader-web.js'
import { createLoggerWeb } from './services/logger/web/logger-web.js'
import { createSentryWeb } from './services/sentry/web/sentry-web.js'

import type { ResolvedDesign } from './entities/obtainers/design.js'
import type { ResolvedFill } from './entities/obtainers/fills.js'
import type { ResolvedFrame } from './entities/obtainers/frame-like.js'
import type { ResolvedPreview } from './entities/obtainers/preview.js'
import type { ParserOptions, Design } from './parser.js'
import type { WebFactories } from './services/platforms/index.js'

export type { Design, ResolvedDesign, ResolvedFrame, ResolvedFill, ResolvedPreview }

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
