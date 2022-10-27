import type { SourceArtboard } from '../../../entities/source/source-artboard'
import type { SourceDesign } from '../../../entities/source/source-design'
import type { ArtboardConversionResult, DesignConversionResult } from '../design-converter'

export type AuxiliaryData = { metadata: string; images: string[]; additionalTextData: string | null }

export interface Exporter {
  exportAuxiliaryData?(_design: SourceDesign): Promise<AuxiliaryData>
  exportImage?(_path: string, _data: Buffer): Promise<unknown>
  exportArtboard?(_source: SourceArtboard, _artboard: ArtboardConversionResult): Promise<unknown>
  exportManifest?(_manifest: DesignConversionResult): Promise<unknown>
  getBasePath(): Promise<string>
  finalizeExport(): void
}
