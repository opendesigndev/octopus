import { benchmarkAsync } from '@opendesign/octopus-common/dist/utils/benchmark-node.js'

import { OctopusFigConverter } from './octopus-fig-converter.js'
import { base64ToUint8Array } from './services/general/buffer/buffer-node.js'
import { createEnvironmentNode } from './services/general/environment/node/env-node.js'
import { imageSize } from './services/general/image-size/image-size-node.js'
import { createLoggerNode } from './services/general/logger/node/logger-node.js'

import type { OctopusConverterOptions } from './octopus-fig-converter.js'
import type { NodeFactories } from './services/general/platforms/index.js'

export { LocalExporter } from './services/exporters/node/local-exporter.js'
export { DebugExporter } from './services/exporters/node/debug-exporter.js'
export { SourceApiReader } from './services/readers/source-api-reader.js'
export { SourcePluginReader } from './services/readers/source-plugin-reader/index.js'

export type { SourceDesign } from './entities/source/source-design.js'
export type { PluginSource } from './services/readers/source-plugin-reader/index.js'

export function createConverter(options?: Omit<OctopusConverterOptions, 'platformFactories'>): OctopusFigConverter {
  return new OctopusFigConverter({
    ...options,
    platformFactories: {
      createEnvironment: createEnvironmentNode,
      createLoggerFactory: createLoggerNode,
      createBenchmarkService: () => ({ benchmarkAsync }),
      createImageSizeService: () => imageSize,
      createBufferService: () => ({ base64ToUint8Array }),
    } as NodeFactories,
  })
}
