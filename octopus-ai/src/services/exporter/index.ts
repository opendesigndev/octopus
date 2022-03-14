import type { ArtboardConversionResult, DesignConversionResult } from '../../'
import type SourceArtboard from '../../entities/source/source-artboard'
import type SourceDesign from '../../entities/source/source-design'

export interface Exporter {
  exportSourceDesign?(_design: SourceDesign): Promise<unknown>
  exportImage?(_name: string, _data: Buffer): Promise<unknown>
  exportArtboard?(_source: SourceArtboard, _artboard: ArtboardConversionResult): Promise<unknown>
  exportManifest?(_manifest: DesignConversionResult): Promise<unknown>
  getBasePath(): Promise<string>
}
