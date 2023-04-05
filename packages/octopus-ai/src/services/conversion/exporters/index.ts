import type { SourceArtboard } from '../../../entities/source/source-artboard.js'
import type { SourceDesign } from '../../../entities/source/source-design.js'
import type { ArtboardConversionResult, DesignConversionResult } from '../design-converter/index.js'
import type { SourceImage } from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'

export type AuxiliaryData = { metadata: string; additionalTextData: string | null }

export abstract class Exporter {
  exportImage(image: SourceImage): Promise<unknown> {
    const { id } = image
    console.log('calling default export method `exportImage()`')
    return Promise.resolve(id)
  }

  finalizeExport(): void {
    console.log('calling default export method `finalizeExport()`')
    Promise.resolve()
  }

  exportArtboard(_source: SourceArtboard, _artboard: ArtboardConversionResult): Promise<unknown> {
    console.log('calling default export method `exportArtboard()`')
    return Promise.resolve()
  }

  exportManifest(_manifest: DesignConversionResult): Promise<unknown> {
    console.log('calling default export method `exportManifest()`')
    return Promise.resolve()
  }

  exportAuxiliaryData(_design: SourceDesign): Promise<AuxiliaryData> {
    console.log('calling default export method `exportAuxiliaryData()`')
    return Promise.resolve({ metadata: '', additionalTextData: null })
  }

  getBasePath(): Promise<string> {
    console.log('calling default export method `getBasePath()`')
    return Promise.resolve('')
  }
}
