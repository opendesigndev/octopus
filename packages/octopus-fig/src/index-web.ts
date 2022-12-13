import { benchmarkAsync } from '@opendesign/octopus-common/dist/utils/benchmark-web'

import { OctopusFigConverter } from './octopus-fig-converter'
import { imageSize } from './services/general/image-size/image-size-web'
import { createLoggerWeb } from './services/general/logger/web/logger-web'

import type { SourceDesign } from './entities/source/source-design'
import type { OctopusConverterOptions } from './octopus-fig-converter'
import type { WebFactories } from './services/general/platforms'

export type { SourceDesign }

export { SourceApiReader } from './services/readers/source-api-reader'
export { SourcePluginReader } from './services/readers/source-plugin-reader'

const buffer = {
  base64ToBuffer: (base64: string) => Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)),
}

export function createConverter(options?: Omit<OctopusConverterOptions, 'platformFactories'>): OctopusFigConverter {
  return new OctopusFigConverter({
    ...options,
    platformFactories: {
      createLoggerFactory: createLoggerWeb,
      createBenchmarkService: () => ({ benchmarkAsync }),
      createImageSizeService: () => imageSize,
      createBufferService: () => buffer,
    } as WebFactories,
  })
}
