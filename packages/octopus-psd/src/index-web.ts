import { benchmarkAsync } from '@opendesign/octopus-common/dist/utils/benchmark-web.js'

import { OctopusPSDConverter } from './octopus-psd-converter.js'
import { createLoggerWeb } from './services/general/logger/web/logger-web.js'
import { PSDFileReaderWeb } from './services/readers/psd-file-reader-web.js'

import type { OctopusPSDConverterOptions } from './octopus-psd-converter'
import type { WebFactories } from './services/general/platforms/index.js'

export { PSDFileReaderWeb }

export function createConverter(options?: Omit<OctopusPSDConverterOptions, 'platformFactories'>): OctopusPSDConverter {
  return new OctopusPSDConverter({
    ...options,
    platformFactories: {
      createLoggerFactory: createLoggerWeb,
      createBenchmarkService: () => ({ benchmarkAsync }),
    } as WebFactories,
  })
}
