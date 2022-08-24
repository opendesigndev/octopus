import type { OctopusArtboard } from '../entities/octopus/octopus-artboard'
import type { OctopusLayerGroup } from '../entities/octopus/octopus-layer-group'
import type { OctopusLayerMaskGroup } from '../entities/octopus/octopus-layer-mask-group'
import type { OctopusLayerShading } from '../entities/octopus/octopus-layer-shading'
import type { OctopusLayerShapeShapeAdapter } from '../entities/octopus/octopus-layer-shape-shape-adapter'
import type { OctopusLayerShapeXObjectImageAdapter } from '../entities/octopus/octopus-layer-shape-x-object-image-adapter'
import type { OctopusLayerSoftMaskGroup } from '../entities/octopus/octopus-layer-soft-mask-group'

export type OctopusLayerParent = OctopusLayerGroup | OctopusArtboard | OctopusLayerMaskGroup | OctopusLayerSoftMaskGroup
export type OctopusEffectParent =
  | OctopusLayerShapeXObjectImageAdapter
  | OctopusLayerShapeShapeAdapter
  | OctopusLayerShading
