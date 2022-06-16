import type { ArtboardConversionResult, DesignConversionResult } from '../..'

export abstract class AbstractExporter {
  exportSource?(_raw: unknown, _name?: string): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportSource" method implemented!')
  }

  exportArtboard(_artboard: ArtboardConversionResult): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportArtboard" method implemented!')
  }

  exportImage?(_name: string, _data: Buffer): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportImage" method implemented!')
  }

  exportPreview?(_name: string, _data: Buffer): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportPreview" method implemented!')
  }

  exportManifest(_manifest: DesignConversionResult, _shouldEmit?: boolean): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportManifest" method implemented!')
  }

  finalizeExport(): void {
    throw new Error('Subclass of "Exporter" has no "finalizeExport" method implemented!')
  }

  abstract getBasePath(): Promise<string>
}
