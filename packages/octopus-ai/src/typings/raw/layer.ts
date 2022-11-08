import type { RawResourcesXObject } from '.'
import type { RawGroupLayer } from './group-layer'
import type { RawShapeLayer } from './shape-layer'
import type { RawTextLayer } from './text-layer'

export type RawLayer = RawTextLayer | RawGroupLayer | RawShapeLayer | RawResourcesXObject
