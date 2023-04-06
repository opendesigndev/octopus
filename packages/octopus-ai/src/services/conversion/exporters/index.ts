import type { SourceArtboard } from '../../../entities/source/source-artboard.js'
import type { SourceDesign } from '../../../entities/source/source-design.js'
import type { ComponentConversionResult, DesignConversionResult } from '../design-converter/index.js'

export type AuxiliaryData = { metadata: string; additionalTextData: string | null }

export interface Exporter {
  exportAuxiliaryData?(_design: SourceDesign): Promise<AuxiliaryData>
  exportImage?(_path: string, _data: Uint8Array): Promise<unknown>
  exportArtboard?(_source: SourceArtboard, _artboard: ComponentConversionResult): Promise<unknown>
  exportManifest?(_manifest: DesignConversionResult): Promise<unknown>
  getBasePath(): Promise<string>
  finalizeExport(): void
}
