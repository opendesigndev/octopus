import type { RawBounds } from './shared'
import type { RawLayer } from './layer'

export type RawArtboard = {
  bounds?: RawBounds
  depth?: number
  exporterVersion?: string
  globalLight?: {
    altitude?: number
    angle?: number
  }
  guides?: {
    x?: number[]
    y?: number[]
  }
  layers?: RawLayer[]
  mode?: string
  profile?: string | null
  resolution?: number
  selection?: []
  subdocuments?: {}
  timeStamp?: number
  version?: string
}
