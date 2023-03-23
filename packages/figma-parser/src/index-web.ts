import { Parser } from './parser'
import BenchmarksTrackerWeb from './services/benchmarks-tracker/web/benchmarks-tracker-web'
import { DownloaderWeb } from './services/downloader/web/downloader-web'
import { createLoggerWeb } from './services/logger/web/logger-web'

import type { ResolvedDesign } from './entities/obtainers/design'
import type { ResolvedFill } from './entities/obtainers/fills'
import type { ResolvedFrame } from './entities/obtainers/frame-like'
import type { ResolvedPreview } from './entities/obtainers/preview'
import type { ResolvedStyle } from './entities/obtainers/styles'
import type { FileMeta } from './entities/structural/file'
import type { ParserOptions, Design } from './parser'
import type { Logger } from './services/logger/logger'
import type { WebFactories } from './services/platforms'
import type { ICacher } from './types/cacher'

export type {
  Design,
  ResolvedDesign,
  ResolvedFrame,
  ResolvedStyle,
  ResolvedFill,
  ResolvedPreview,
  Logger,
  ICacher,
  FileMeta,
}

export function createParser(options: Omit<ParserOptions, 'platformFactories'>): Parser {
  return new Parser({
    ...options,
    platformFactories: {
      createDownloader: (options) => new DownloaderWeb(options),
      createBenchmarksTracker: () => new BenchmarksTrackerWeb(),
      createLoggerFactory: () => createLoggerWeb,
    } as WebFactories,
  })
}
