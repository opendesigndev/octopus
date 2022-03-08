import type { ArtboardConversionResult, DesignConversionResult } from '../../..'
import type SourceArtboard from '../../../entities/source/source-artboard'
import type SourceDesign from '../../../entities/source/source-design'

export abstract class Exporter {
  exportSourceDesign?(_design: SourceDesign): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportSourceDesign" method implemented!')
  }
  exportImage?(_name: string, _data: Buffer): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportImage" method implemented!')
  }
  exportArtboard?(_source: SourceArtboard, _artboard: ArtboardConversionResult): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportArtboard" method implemented!')
  }
  exportManifest?(_manifest: DesignConversionResult): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportManifest" method implemented!')
  }
  abstract getBasePath(): Promise<string>
}
