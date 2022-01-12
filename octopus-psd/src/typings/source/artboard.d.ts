import { RawBounds } from './bounds'
import { RawLayer } from './layer'

export type RawArtboard = {
  bounds?: RawBounds
  depth?: number
  exporterVersion?: string
  globalLight?: {
    altitude?: number
    angle?: number
  }
  guides?: {
    x?: []
    y?: []
  }
  layers?: [RawLayer]
  mode?: string
  profile?: string
  resolution?: number
  selection?: []
  subdocuments?: {}
  timeStamp?: number
  version?: string
}
