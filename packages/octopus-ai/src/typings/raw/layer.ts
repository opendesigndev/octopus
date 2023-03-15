import type { RawGroupLayer } from './group-layer.js'
import type { RawResourcesXObject } from './index.js'
import type { RawShapeLayer } from './shape-layer.js'
import type { RawTextLayer } from './text-layer.js'

export type RawLayer = RawTextLayer | RawGroupLayer | RawShapeLayer | RawResourcesXObject
