import type { SourceArtboard } from '../../../entities/source/source-artboard.js'
import type { SourceDesign } from '../../../entities/source/source-design.js'
import type { ComponentConversionResult, DesignConversionResult } from '../../../octopus-xd-converter.js'
import type { SourceImage } from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'

export abstract class Exporter {
  exportSourceDesign?(_design: SourceDesign): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportSourceDesign" method implemented!')
  }
  exportImage?(_image: SourceImage): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportImage" method implemented!')
  }
  exportArtboard?(_source: SourceArtboard, _artboard: ComponentConversionResult): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportArtboard" method implemented!')
  }
  exportManifest?(_manifest: DesignConversionResult): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportManifest" method implemented!')
  }
  finalizeExport?(): void {
    throw new Error('Subclass of "Exporter" has no "finalizeExport" method implemented!')
  }

  getBasePath(): Promise<string> {
    console.log('calling default export method `getBasePath()`')
    return Promise.resolve('')
  }
}

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
