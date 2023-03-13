import { benchmarkAsync } from '@opendesign/octopus-common/dist/utils/benchmark-node.js'

import { OctopusPSDConverter } from './octopus-psd-converter.js'
import { DebugExporter } from './services/exporters/debug-exporter.js'
import { LocalExporter } from './services/exporters/local-exporter.js'
import { createEnvironmentNode } from './services/general/environment/node/env-node.js'
import { createLoggerNode } from './services/general/logger/node/logger-node.js'
import { PSDFileReaderNode } from './services/readers/node/psd-file-reader-node.js'

import type { OctopusPSDConverterOptions } from './octopus-psd-converter'

export { PSDFileReaderNode, LocalExporter, DebugExporter }

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
