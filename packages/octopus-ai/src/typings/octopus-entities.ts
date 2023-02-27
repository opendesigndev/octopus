import type { OctopusArtboard } from '../entities/octopus/octopus-artboard.js'
import type { OctopusLayerGroup } from '../entities/octopus/octopus-layer-group.js'
import type { OctopusLayerMaskGroup } from '../entities/octopus/octopus-layer-mask-group.js'
import type { OctopusLayerShading } from '../entities/octopus/octopus-layer-shading.js'
import type { OctopusLayerShapeShapeAdapter } from '../entities/octopus/octopus-layer-shape-shape-adapter.js'
import type { OctopusLayerShapeXObjectImageAdapter } from '../entities/octopus/octopus-layer-shape-x-object-image-adapter.js'
import type { OctopusLayerSoftMaskGroup } from '../entities/octopus/octopus-layer-soft-mask-group.js'

export type OctopusLayerParent = OctopusLayerGroup | OctopusArtboard | OctopusLayerMaskGroup | OctopusLayerSoftMaskGroup
export type OctopusEffectParent =
  | OctopusLayerShapeXObjectImageAdapter
  | OctopusLayerShapeShapeAdapter
  | OctopusLayerShading
