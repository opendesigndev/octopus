import type { SourceArtboard } from '../../../entities/source/source-artboard.js'
import type { SourceDesign } from '../../../entities/source/source-design.js'
import type { ArtboardConversionResult, DesignConversionResult } from '../design-converter/index.js'

export type AuxiliaryData = { metadata: string; additionalTextData: string | null }

export interface Exporter {
  exportAuxiliaryData?(_design: SourceDesign): Promise<AuxiliaryData>
  exportImage?(_path: string, _data: Buffer): Promise<unknown>
  exportArtboard?(_source: SourceArtboard, _artboard: ArtboardConversionResult): Promise<unknown>
  exportManifest?(_manifest: DesignConversionResult): Promise<unknown>
  getBasePath(): Promise<string>
  finalizeExport(): void
}
