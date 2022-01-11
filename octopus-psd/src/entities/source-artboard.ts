export type SourceArtboard = {
  bounds: { bottom: number; left: number; right: number; top: number }
  depth: number
  exporterVersion: string
  globalLight: { altitude: number; angle: number }
  guides: { x: []; y: [] }
  layers: [
    {
      alignEdges: boolean
      bitmapBounds: [Object]
      bounds: [Object]
      clipped: boolean
      fill: [Object]
      id: number
      imageEffectsApplied: boolean
      imageName: string
      layerEffects: [Object]
      mask: [Object]
      name: string
      path: [Object]
      type: string
      visible: true
    },
    {
      bitmapBounds: [Object]
      bounds: [Object]
      clipped: boolean
      id: number
      imageEffectsApplied: boolean
      imageName: string
      name: string
      type: string
      visible: boolean
    }
  ]
  mode: string
  profile: string
  resolution: number
  selection: []
  subdocuments: {}
  timeStamp: number
  version: string
}
