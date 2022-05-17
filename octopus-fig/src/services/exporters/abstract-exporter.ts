import type { ArtboardConversionResult, DesignConversionResult } from '../..'
import type { SourceDesign } from '../../entities/source/source-design'

export abstract class AbstractExporter {
  exportSourceDesign?(_design: SourceDesign): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportSourceDesign" method implemented!')
  }

  exportArtboard(_artboard: ArtboardConversionResult): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportArtboard" method implemented!')
  }

  exportImage(_name: string, _path: string): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportImage" method implemented!')
  }

  exportManifest(_manifest: DesignConversionResult, _shouldEmit?: boolean): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportManifest" method implemented!')
  }

  finalizeExport(): void {
    throw new Error('Subclass of "Exporter" has no "finalizeExport" method implemented!')
  }

  abstract getBasePath(): Promise<string>
}
