import type { ComponentConversionResult, DesignConversionResult } from '../conversion/design-converter.js'

export abstract class AbstractExporter {
  static IMAGES_DIR_NAME: string
  static MANIFEST_NAME: string
  static getOctopusFileName(_id: string): string {
    throw new Error('Subclass of "Exporter" has no "exportComponent" method implemented!')
  }

  exportComponent(_component: ComponentConversionResult): Promise<unknown> {
    throw new Error('Subclass of "Exporter" has no "exportComponent" method implemented!')
  }

  exportImage(_name: string, _data: Uint8Array): Promise<unknown> {
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
