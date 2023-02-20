import { benchmarkAsync } from '@opendesign/octopus-common/dist/utils/benchmark-node.js'

import { OctopusPSDConverter } from './octopus-psd-converter.js'
import { createEnvironmentNode } from './services/general/environment/node/env-node.js'
import { createLoggerNode } from './services/general/logger/node/logger-node.js'

import type { OctopusPSDConverterOptions } from './octopus-psd-converter'

export function createConverter(options?: Omit<OctopusPSDConverterOptions, 'platformFactories'>): OctopusPSDConverter {
  return new OctopusPSDConverter({
    ...options,
    platformFactories: {
      createEnvironment: createEnvironmentNode,
      createLoggerFactory: createLoggerNode,
      createBenchmarkService: () => ({ benchmarkAsync }),
    },
  })
}
