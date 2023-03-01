import type { ComponentConversionResult, DesignConversionResult } from '../conversion/design-converter.js'

/**
 * Minimalistic exporter used for web build
 */
export class WebExporter {
  static IMAGES_DIR_NAME: string
  static MANIFEST_NAME: string
  static getOctopusFileName(_id: string): string {
    throw new Error('Subclass of "Exporter" has no "exportComponent" method implemented!')
  }

  exportComponent(_component: ComponentConversionResult): Promise<unknown> {
    return Promise.resolve()
  }

  exportImage(name: string, _data: Uint8Array): Promise<unknown> {
    return Promise.resolve(name)
  }

  exportManifest(_manifest: DesignConversionResult): Promise<unknown> {
    return Promise.resolve()
  }

  finalizeExport(): void {
    return
  }

  getBasePath(): Promise<string> {
    return Promise.resolve('hello')
  }
}
