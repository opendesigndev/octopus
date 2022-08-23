import { benchmarkAsync } from '@avocode/octopus-common/dist/utils/benchmark-web'

import { OctopusFigConverter } from './octopus-fig-converter'
import { createLoggerWeb } from './services/general/logger/web/logger-web'

import type { SourceDesign } from './entities/source/source-design'
import type { OctopusConverterOptions } from './octopus-fig-converter'
import type { WebFactories } from './services/general/platforms'

export type { SourceDesign }

export { SourceApiReader } from './services/readers/source-api-reader'

export function createConverter(options: Omit<OctopusConverterOptions, 'platformFactories'>): OctopusFigConverter {
  return new OctopusFigConverter({
    ...options,
    platformFactories: {
      createLoggerFactory: createLoggerWeb,
      createBenchmarkService: () => {
        return {
          benchmarkAsync,
        }
      },
    } as WebFactories,
  })
}