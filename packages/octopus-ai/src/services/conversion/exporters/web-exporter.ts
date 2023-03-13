import type { SourceArtboard } from '../../../entities/source/source-artboard.js'
import type { SourceDesign } from '../../../octopus-ai-converter.js'
import type { ArtboardConversionResult, DesignConversionResult } from '../design-converter/index.js'
import type { AuxiliaryData, Exporter } from './index.js'

/**
 * Minimalistic exporter used for web build
 */
export class WebExporter {
  exportImage(name: string, _data: Uint8Array): Promise<unknown> {
    return Promise.resolve(name)
  }

  getBasePath(): Promise<string> {
    return Promise.resolve('')
  }

  finalizeExport(): void {
    Promise.resolve()
  }
  exportArtboard(_source: SourceArtboard, _artboard: ArtboardConversionResult): Promise<unknown> {
    console.log('Exporting artboard')
    return Promise.resolve()
  }

  exportManifest(_manifest: DesignConversionResult): Promise<unknown> {
    console.log('Exporting manifest')
    return Promise.resolve()
  }

  exportAuxiliaryData(_design: SourceDesign): Promise<AuxiliaryData> {
    console.log('Exporting auxiliary data')
    return Promise.resolve({ metadata: '', additionalTextData: null })
  }
}
