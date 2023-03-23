import { Parser } from './parser'
import BenchmarksTrackerNode from './services/benchmarks-tracker/node/benchmarks-tracker-node'
import { DownloaderNode } from './services/downloader/node/downloader-node'
import { createEnvironmentNode } from './services/environment'
import { createLoggerNode } from './services/logger/node/logger-node'

import type { ResolvedDesign } from './entities/obtainers/design'
import type { ResolvedFill } from './entities/obtainers/fills'
import type { ResolvedFrame } from './entities/obtainers/frame-like'
import type { ResolvedPreview } from './entities/obtainers/preview'
import type { ResolvedStyle } from './entities/obtainers/styles'
import type { FileMeta } from './entities/structural/file'
import type { ParserOptions, Design } from './parser'
import type { Logger } from './services/logger/logger'
import type { NodeFactories } from './services/platforms'
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
      createDownloader: (options) => new DownloaderNode(options),
      createBenchmarksTracker: () => new BenchmarksTrackerNode(),
      createLoggerFactory: () => createLoggerNode,
      createEnvironment: () => createEnvironmentNode,
    } as NodeFactories,
  })
}
