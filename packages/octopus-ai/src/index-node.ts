import { OctopusAIConverter } from './octopus-ai-converter.js'
import { LocalExporter } from './services/conversion/exporters/local-exporter.js'
import { TempExporter } from './services/conversion/exporters/temp-exporter.js'
import { WebExporter } from './services/conversion/exporters/web-exporter.js'
import { createBenchmarkServiceNode } from './services/general/benchmark-service/node/benchmark-service-node.js'
import { createEnvironmentNode } from './services/general/environment/node/env-node.js'
import { createLoggerNode } from './services/general/logger/node/logger-node.js'
import { AIFileReader } from './services/readers/node/index.js'

import type { OctopusAIConverteOptions } from './octopus-ai-converter.js'

export { AIFileReader, LocalExporter, TempExporter, WebExporter }

export function createConverter(options?: Omit<OctopusAIConverteOptions, 'platformFactories'>): OctopusAIConverter {
  return new OctopusAIConverter({
    ...options,
    platformFactories: {
      createEnvironment: createEnvironmentNode,
      createLoggerFactory: createLoggerNode,
      createBenchmarkService: createBenchmarkServiceNode,
    },
  })
}
