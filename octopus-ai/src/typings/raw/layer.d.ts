import type { RawGroupLayer } from './group-layer'
import type { RawShapeLayer } from './shape-layer'
import type { RawTextLayer } from './text-layer'
import type { RawXObjectLayer } from './x-object'

export type RawLayer = RawTextLayer | RawGroupLayer | RawShapeLayer | RawXObjectLayer
