export type RawMetadataArtboard = {
  Name?: string
  viewFilename?: string
}

export type RawMetadata = {
  Artboards?: {
    [id: string]: RawMetadataArtboard
  }
  Version?: string
}
