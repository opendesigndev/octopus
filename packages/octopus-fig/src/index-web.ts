import { benchmarkAsync } from '@opendesign/octopus-common/dist/utils/benchmark-web.js'

import { OctopusFigConverter } from './octopus-fig-converter.js'
import { base64ToUint8Array } from './services/general/buffer/buffer-web.js'
import { imageSize } from './services/general/image-size/image-size-web.js'
import { createLoggerWeb } from './services/general/logger/web/logger-web.js'

import type { SourceDesign } from './entities/source/source-design.js'
import type { OctopusConverterOptions } from './octopus-fig-converter.js'
import type { WebFactories } from './services/general/platforms/index.js'

export type { SourceDesign }

export { SourceApiReader } from './services/readers/source-api-reader.js'
export { SourcePluginReader } from './services/readers/source-plugin-reader/index.js'

export function createConverter(options?: Omit<OctopusConverterOptions, 'platformFactories'>): OctopusFigConverter {
  return new OctopusFigConverter({
    ...options,
    platformFactories: {
      createLoggerFactory: createLoggerWeb,
      createBenchmarkService: () => ({ benchmarkAsync }),
      createImageSizeService: () => imageSize,
      createBufferService: () => ({ base64ToUint8Array }),
    } as WebFactories,
  })
}
