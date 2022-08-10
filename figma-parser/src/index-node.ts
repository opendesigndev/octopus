import { Parser } from './parser.js'
import BenchmarksTrackerNode from './services/benchmarks-tracker/node/benchmarks-tracker-node.js'
import { DownloaderNode } from './services/downloader/node/downloader-node.js'
import { createEnvironmentNode } from './services/environment/index.js'
import { createLoggerNode } from './services/logger/node/logger-node.js'
import { createSentryNode } from './services/sentry/node/sentry-node.js'

import type { ResolvedDesign } from './entities/obtainers/design.js'
import type { ResolvedFill } from './entities/obtainers/fills.js'
import type { ResolvedFrame } from './entities/obtainers/frame-like.js'
import type { ResolvedPreview } from './entities/obtainers/preview.js'
import type { ParserOptions, Design } from './parser.js'
import type { NodeFactories } from './services/platforms/index.js'

export type { Design, ResolvedDesign, ResolvedFrame, ResolvedFill, ResolvedPreview }

export function createParser(options: Omit<ParserOptions, 'platformFactories'>): Parser {
  return new Parser({
    ...options,
    platformFactories: {
      createDownloader: (options) => new DownloaderNode(options),
      createBenchmarksTracker: () => new BenchmarksTrackerNode(),
      createLoggerFactory: () => createLoggerNode,
      createSentryFactory: () => createSentryNode,
      createEnvironment: () => createEnvironmentNode,
    } as NodeFactories,
  })
}
