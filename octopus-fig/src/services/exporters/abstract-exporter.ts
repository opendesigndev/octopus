import type { ArtboardConversionResult } from '../../octopus-fig-converter'
import type { Manifest } from '../../typings/manifest'

export abstract class AbstractExporter {
  exportRawDesign?(_raw: unknown): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportRawDesign" method implemented!')
  }

  exportRawComponent?(_raw: unknown, _name: string): Promise<string> {
    throw new Error('Subclass of "Exporter" has no "exportRawComponent" method implemented!')
  }

  exportArtboard(_artboard: ArtboardConversionResult): Promise<string | null> {
    throw new Error('Subclass of "Exporter" has no "exportArtboard" method implemented!')
  }

  exportImage?(_name: string, _data: ArrayBuffer): Promise<string> {
    throw new Error('Subclass of "Exporter" has no "exportImage" method implemented!')
  }

  exportPreview?(_name: string, _data: ArrayBuffer): Promise<string> {
    throw new Error('Subclass of "Exporter" has no "exportPreview" method implemented!')
  }

  exportManifest(_manifest: Manifest['OctopusManifest']): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportManifest" method implemented!')
  }

  finalizeExport(): void {
    throw new Error('Subclass of "Exporter" has no "finalizeExport" method implemented!')
  }
}
