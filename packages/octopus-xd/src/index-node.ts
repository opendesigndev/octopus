import { benchmarkAsync } from '@opendesign/octopus-common/dist/utils/benchmark-node.js'

import { OctopusXDConverter } from './octopus-xd-converter.js'
import { createEnvironmentNode } from './services/general/environment/index.js'
import { createLoggerNode } from './services/general/logger/node/logger-node.js'

import type { SourceDesign } from './entities/source/source-design.js'
import type { OctopusXDConverterOptions } from './octopus-xd-converter.js'
import type { NodeFactories } from './services/general/platforms/index.js'

export { LocalExporter } from './services/conversion/exporter/node/local-exporter.js'
export { TempExporter } from './services/conversion/exporter/node/temp-exporter.js'
export { XDFileReader } from './services/conversion/xd-file-reader/node/index.js'

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
