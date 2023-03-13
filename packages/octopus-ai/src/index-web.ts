import { OctopusAIConverter } from './octopus-ai-converter.js'
import { WebExporter } from './services/conversion/exporters/web-exporter.js'
import { createBenchmarkServiceWeb } from './services/general/benchmark-service/web/benchmark-service-web.js'
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
      createBenchmarkService: createBenchmarkServiceWeb,
    } as WebFactories,
  })
}
