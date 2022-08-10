import type { RawGroupLayer } from './group-layer.js'
import type { RawShapeLayer } from './shape-layer.js'
import type { RawTextLayer } from './text-layer.js'
import type { RawXObjectLayer } from './x-object.js'

export type RawLayer = RawTextLayer | RawGroupLayer | RawShapeLayer | RawXObjectLayer
