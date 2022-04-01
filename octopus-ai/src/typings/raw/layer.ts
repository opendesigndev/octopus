import { RawTextLayer } from './text-layer'
import { RawGroupLayer } from './group-layer'
import { RawShapeLayer } from './shape-layer'
import { RawXObjectLayer } from './x-object'

export type RawLayer = RawTextLayer | RawGroupLayer | RawShapeLayer | RawXObjectLayer
