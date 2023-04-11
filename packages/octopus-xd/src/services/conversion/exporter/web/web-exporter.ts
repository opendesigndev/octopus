import { Exporter } from '../index.js'

import type { SourceArtboard } from '../../../../entities/source/source-artboard.js'
import type { ComponentConversionResult, DesignConversionResult } from '../../../../octopus-xd-converter.js'
import type { SourceImage } from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'

/**
 * Minimalistic exporter used for web build
 */
export class WebExporter extends Exporter {
  exportArtboard(_: SourceArtboard, _artboard: ComponentConversionResult): Promise<unknown> {
    console.log('exportArtboard')
    return Promise.resolve()
  }

  exportImage(image: SourceImage): Promise<unknown> {
    console.log('exportImage', image.id)
    return Promise.resolve(image.id)
  }

  exportManifest(_manifest: DesignConversionResult): Promise<unknown> {
    console.log('exportManifest')
    return Promise.resolve()
  }

  finalizeExport(): void {
    console.log('finalizeExport')
    return
  }

  getBasePath(): Promise<string> {
    console.log('getBasePath')
    return Promise.resolve('')
  }
}
