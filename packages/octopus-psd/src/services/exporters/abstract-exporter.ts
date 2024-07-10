import type { ComponentConversionResult, DesignConversionResult } from '../conversion/design-converter.js'
import type { SourceImage } from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'

export abstract class AbstractExporter {
  exportComponent(_component: ComponentConversionResult): Promise<unknown> {
    console.log('calling default export method `exportComponent()`')
    return Promise.resolve()
  }

  exportImage(image: SourceImage): Promise<unknown> {
    const { id } = image
    console.log('calling default export method `exportImage()`')
    return Promise.resolve(id)
  }

  exportManifest(_manifest: DesignConversionResult): Promise<unknown> {
    console.log('calling default export method `exportManifest()`')
    return Promise.resolve()
  }

  finalizeExport(): void {
    console.log('calling default export method `finalizeExport()`')
    Promise.resolve()
  }

  exportStatistics(_statistics?: object): Promise<string> {
    console.log('calling default export method `exportStatistics()`')
    return Promise.resolve('')
  }

  getBasePath(): Promise<string> {
    console.log('calling default export method `getBasePath()`')
    return Promise.resolve('')
  }
}
