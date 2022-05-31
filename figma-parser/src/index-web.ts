import { Parser } from './parser'
import BenchmarkHTTPRequestWeb from './services/benchmarks-tracker/web/benchmark-http-request-web'
import BenchmarkSimpleWeb from './services/benchmarks-tracker/web/benchmark-simple-web'
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
      createBenchmarkHTTPRequest: (request) => new BenchmarkHTTPRequestWeb(request),
      createBenchmarkSimple: (label) => new BenchmarkSimpleWeb(label),
      createBenchmarksTracker: () => new BenchmarksTrackerWeb(),
      createLoggerFactory: () => createLoggerWeb,
      createSentryFactory: () => createSentryWeb,
    } as WebFactories,
  })
}

export const run = (): void => {
  const parser = createParser({
    designId: '9lJg7hAgjsDgrpueS30dMg',
    token: '117960-0bf13919-ba73-427d-800a-07c02b5f71a3',
    ids: [],
    host: 'api.figma.com',
    pixelsLimit: 1e7,
    framePreviews: true,
    previewsParallels: 3,
    // framePreviews: boolean
    tokenType: 'personal',
    // previewsParallels: number
    nodesParallels: 50,
    s3Parallels: 30,
    verbose: true,
    figmaIdsFetchUsedComponents: true,
    renderImagerefs: true,
    shouldObtainLibraries: true,
    shouldObtainStyles: true,
    parallelRequests: 10,
  })

  const design = parser.parse()
  design.on('ready:frame-like', (...args) => {
    console.log(args)
  })
}
