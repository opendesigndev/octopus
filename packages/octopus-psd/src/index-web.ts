import { benchmarkAsync } from '@opendesign/octopus-common/dist/utils/benchmark-web.js'

import { OctopusPSDConverter } from './octopus-psd-converter.js'
import { WebExporter } from './services/exporters/web-exporter.js'
import { createLoggerWeb } from './services/general/logger/web/logger-web.js'
import { PSDFileReader } from './services/readers/web/psd-file-reader-web.js'

import type { OctopusPSDConverterOptions } from './octopus-psd-converter'
import type { WebFactories } from './services/general/platforms/index.js'

export { PSDFileReader, WebExporter }

export function createConverter(options?: Omit<OctopusPSDConverterOptions, 'platformFactories'>): OctopusPSDConverter {
  return new OctopusPSDConverter({
    ...options,
    platformFactories: {
      createLoggerFactory: createLoggerWeb,
      createBenchmarkService: () => ({ benchmarkAsync }),
    } as WebFactories,
  })
}
