import { SourceImage } from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'
import { AbstractExporter } from './abstract-exporter.js'
import { PSDExporter } from './index.js'

/**
 * Minimalistic exporter used for web build
 */
export class WebExporter implements PSDExporter {
  exportImage(image: SourceImage): Promise<string> {
    const { id } = image
    console.log('calling default export method `exportImage()`')
    return Promise.resolve(id)
  }
}
