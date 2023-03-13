import { benchmarkAsync } from '@opendesign/octopus-common/dist/utils/benchmark-web.js'

import { OctopusAIConverter } from './octopus-ai-converter.js'
import { WebExporter } from './services/conversion/exporters/web-exporter.js'
import { createLoggerWeb } from './services/general/logger/web/logger-web.js'
import { AIFileReader } from './services/readers/web/index.js'

import type { OctopusAIConverteOptions } from './octopus-ai-converter.js'
import type { WebFactories } from './services/general/platforms/index.js'

export { AIFileReader, WebExporter }

export function createConverter(options?: Omit<OctopusAIConverteOptions, 'platformFactories'>): OctopusAIConverter {
  return new OctopusAIConverter({
    ...options,
    platformFactories: {
      createLoggerFactory: createLoggerWeb,
      createBenchmarkService: () => ({ benchmarkAsync }),
    } as WebFactories,
  })
}
