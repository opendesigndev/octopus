/**
 * Minimalistic exporter used for web build
 */
export class WebExporter {
  exportImage(name: string, _data: Uint8Array): Promise<unknown> {
    return Promise.resolve(name)
  }
}
