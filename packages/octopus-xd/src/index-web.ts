import { benchmarkAsync } from '@opendesign/octopus-common/dist/utils/benchmark-web.js'

import { OctopusXDConverter } from './octopus-xd-converter.js'
import { createLoggerWeb } from './services/general/logger/web/logger-web.js'

import type { SourceDesign } from './entities/source/source-design.js'
import type { OctopusXDConverterOptions } from './octopus-xd-converter.js'
import type { WebFactories } from './services/general/platforms/index.js'

export type { SourceDesign }

export { XDFileReader } from './services/conversion/xd-file-reader/web/index.js'
export { WebExporter } from './services/conversion/exporter/web/web-exporter.js'

export function createConverter(options: Omit<OctopusXDConverterOptions, 'platformFactories'>): OctopusXDConverter {
  return new OctopusXDConverter({
    ...options,
    platformFactories: {
      createLoggerFactory: () => createLoggerWeb,
      createBenchmarkService: () => {
        return {
          benchmarkAsync,
        }
      },
    } as WebFactories,
  })
}
