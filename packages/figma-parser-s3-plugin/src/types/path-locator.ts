export interface IPathLocator {
  // map
  getCacheMap(): Promise<string>

  // manifest
  // getManifest(): Promise<string>

  // octopus (manifest)
  // getManifestOctopus(id: string): Promise<string>
  // getManifestChunk(id: string): Promise<string>
  // getManifestFrameLike(id: string): Promise<string>
  // getManifestLibrary(id: string): Promise<string>
  // getManifestPreview(id: string): Promise<string>
  // getManifestFill(id: string): Promise<string>

  // octopus
  // getOctopus(id: string): Promise<string>
  // getChunk(id: string): Promise<string>

  // sources
  getDesign(id: string): Promise<string>
  getFrameLike(designId: string, id: string): Promise<string>
  getLibrary(id: string): Promise<string>
  getPreview(designId: string, nodeId: string): Promise<string>
  getFill(designId: string, ref: string): Promise<string>
}
