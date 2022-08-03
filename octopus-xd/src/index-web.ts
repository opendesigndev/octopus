import { benchmarkAsync } from '@avocode/octopus-common/dist/utils/benchmark-web'

import { OctopusXDConverter } from './octopus-xd-converter'
import { createLoggerWeb } from './services/general/logger/web/logger-web'

import type { OctopusXDConverterOptions } from './octopus-xd-converter'
import type { WebFactories } from './services/general/platforms'

export { XDFileReader } from './services/conversion/xd-file-reader/web'

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
