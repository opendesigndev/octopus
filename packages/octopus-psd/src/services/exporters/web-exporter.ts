import type { ComponentConversionResult, DesignConversionResult } from '../conversion/design-converter.js'
/**
 * Minimalistic exporter used for web build
 */
export class WebExporter {
  exportComponent(_component: ComponentConversionResult): Promise<unknown> {
    console.log('exportComponent')
    return Promise.resolve()
  }

  exportImage(name: string, _data: Uint8Array): Promise<unknown> {
    console.log('exportImage', name)
    return Promise.resolve(name)
  }

  exportManifest(_manifest: DesignConversionResult): Promise<unknown> {
    console.log('exportManifest')
    return Promise.resolve()
  }

  finalizeExport(): void {
    console.log('finalizeExport')
    return
  }

  getBasePath(): Promise<string> {
    console.log('getBasePath')
    return Promise.resolve('')
  }
}
