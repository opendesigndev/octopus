import { benchmarkAsync } from '@opendesign/octopus-common/utils/benchmark'

import { OctopusFigConverter } from './octopus-fig-converter'
import { base64ToUint8Array } from './services/general/buffer/buffer-node'
import { createEnvironmentNode } from './services/general/environment/node/env-node'
import { imageSize } from './services/general/image-size/image-size-node'
import { createLoggerNode } from './services/general/logger/node/logger-node'

import type { SourceDesign } from './entities/source/source-design'
import type { OctopusConverterOptions } from './octopus-fig-converter'
import type { NodeFactories } from './services/general/platforms'

export { LocalExporter } from './services/exporters/node/local-exporter'
export { DebugExporter } from './services/exporters/node/debug-exporter'
export { SourceApiReader } from './services/readers/source-api-reader'
export { SourcePluginReader } from './services/readers/source-plugin-reader'

export type { SourceDesign }

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
