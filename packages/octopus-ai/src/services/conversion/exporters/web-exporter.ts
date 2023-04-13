import type { AIExporter } from './index.js'
import type { SourceImage } from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'

/**
 * Minimalistic exporter used for web build
 */
export class WebExporter implements AIExporter {
  exportImage(image: SourceImage): Promise<string> {
    const { id } = image
    console.log('calling export method `exportImage()`')
    return Promise.resolve(id)
  }
}
