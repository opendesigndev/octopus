import type { SourceArtboard } from '../../../entities/source/source-artboard.js'
import type { SourceDesign } from '../../../entities/source/source-design.js'
import type { ComponentConversionResult, DesignConversionResult } from '../../../octopus-xd-converter.js'

export abstract class Exporter {
  exportSourceDesign?(_design: SourceDesign): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportSourceDesign" method implemented!')
  }
  exportImage?(_name: string, _data: Uint8Array): Promise<unknown> {
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
  abstract getBasePath(): Promise<string>
}
