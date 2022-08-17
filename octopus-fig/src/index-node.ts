import { benchmarkAsync } from '@avocode/octopus-common/dist/utils/benchmark-node'

import { OctopusFigConverter } from './octopus-fig-converter'
import { createEnvironmentNode } from './services/general/environment'
import { createLoggerNode } from './services/general/logger/node/logger-node'

import type { SourceDesign } from './entities/source/source-design'
import type { OctopusConverterOptions } from './octopus-fig-converter'
import type { NodeFactories } from './services/general/platforms'

export { LocalExporter } from './services/exporters/node/local-exporter'
export { DebugExporter } from './services/exporters/node/debug-exporter'
export { SourceApiReader } from './services/readers/source-api-reader'

export type { SourceDesign }

export function createConverter(options: Omit<OctopusConverterOptions, 'platformFactories'>): OctopusFigConverter {
  return new OctopusFigConverter({
    ...options,
    platformFactories: {
      createLoggerFactory: () => createLoggerNode,
      createEnvironment: () => createEnvironmentNode,
      createBenchmarkService: () => {
        return {
          benchmarkAsync,
        }
      },
    } as NodeFactories,
  })
}
