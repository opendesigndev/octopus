import type {
  ComponentConversionResult,
  Manifest,
} from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'

export abstract class AbstractExporter {
  exportRawDesign?(_raw: unknown): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportRawDesign" method implemented!')
  }

  exportRawComponent?(_raw: unknown, _name: string): Promise<string> {
    throw new Error('Subclass of "Exporter" has no "exportRawComponent" method implemented!')
  }

  exportRawChunk?(_raw: unknown, _name: string): Promise<string> {
    throw new Error('Subclass of "Exporter" has no "exportRawChunk" method implemented!')
  }

  exportComponent(_result: ComponentConversionResult, _role?: Manifest['Component']['role']): Promise<string | null> {
    throw new Error('Subclass of "Exporter" has no "exportComponent" method implemented!')
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
