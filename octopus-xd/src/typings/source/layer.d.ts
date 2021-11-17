import { RawShapeLayer, RawShapeLayerMeta } from '.'
import type {
  RawGroupLayer,
} from './group-layer'

export type RawLayer = 
  | RawGroupLayer
  | RawShapeLayer