import type { RawLayer } from './layer.js'
import type { RawBounds } from './shared.js'

type RawGuides = {
  x?: number[]
  y?: number[]
}

type RawLight = {
  altitude?: number
  angle?: number
}

export type RawComponent = {
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
  subdocuments?: Record<string, unknown>
  timeStamp?: number
  version?: string
}
