import { benchmarkAsync } from '@avocode/octopus-common/dist/utils/benchmark-node'

import { OctopusXDConverter } from './octopus-xd-converter'
import { createEnvironmentNode } from './services/general/environment'
import { createLoggerNode } from './services/general/logger/node/logger-node'

import type { SourceDesign } from './entities/source/source-design'
import type { OctopusXDConverterOptions } from './octopus-xd-converter'
import type { NodeFactories } from './services/general/platforms'

export { LocalExporter } from './services/conversion/exporter/node/local-exporter'
export { TempExporter } from './services/conversion/exporter/node/temp-exporter'
export { XDFileReader } from './services/conversion/xd-file-reader/node'

export type { SourceDesign }

export function createConverter(options: Omit<OctopusXDConverterOptions, 'platformFactories'>): OctopusXDConverter {
  return new OctopusXDConverter({
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
