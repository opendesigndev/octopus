import type { RawBounds } from './shared'
import type { RawLayer } from './layer'

type RawGuides = {
  x?: number[]
  y?: number[]
}

type RawLight = {
  altitude?: number
  angle?: number
}

export type RawArtboard = {
  bounds?: RawBounds
  depth?: number
  exporterVersion?: string
  globalLight?: RawLight
  guides?: RawGuides
  layers?: RawLayer[]
  mode?: string
  profile?: string | null
  resolution?: number
  selection?: []
  subdocuments?: {}
  timeStamp?: number
  version?: string
}
