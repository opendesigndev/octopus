import type { ArtboardConversionResult, DesignConversionResult } from '../..'

export abstract class AbstractExporter {
  exportArtboard(_artboard: ArtboardConversionResult): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportArtboard" method implemented!')
  }

  exportImage(_name: string, _path: string): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportImage" method implemented!')
  }

  exportManifest(_manifest: DesignConversionResult): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportManifest" method implemented!')
  }

  finalizeExport(): void {
    throw new Error('Subclass of "Exporter" has no "finalizeExport" method implemented!')
  }

  abstract getBasePath(): Promise<string>
}
