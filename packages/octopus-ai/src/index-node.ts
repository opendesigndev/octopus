import { benchmarkAsync } from '@opendesign/octopus-common/dist/utils/benchmark-node.js'

import { OctopusAIConverter } from './octopus-ai-converter.js'
import { createEnvironmentNode } from './services/general/environment/node/env-node.js'
import { createLoggerNode } from './services/general/logger/node/logger-node.js'

import type { OctopusAIConverteOptions } from './octopus-ai-converter.js'

export function createConverter(options?: Omit<OctopusAIConverteOptions, 'platformFactories'>): OctopusAIConverter {
  return new OctopusAIConverter({
    ...options,
    platformFactories: {
      createEnvironment: createEnvironmentNode,
      createLoggerFactory: createLoggerNode,
      createBenchmarkService: () => ({ benchmarkAsync }),
    },
  })
}
