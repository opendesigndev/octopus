import type { OctopusArtboard } from '../entities/octopus/octopus-artboard'
import type { OctopusLayerGroup } from '../entities/octopus/octopus-layer-group'
import type { OctopusLayerMaskGroup } from '../entities/octopus/octopus-layer-mask-group'
import type { OctopusLayerSoftMaskGroup } from '../entities/octopus/octopus-layer-soft-mask-group'

export type OctopusLayerParent = OctopusLayerGroup | OctopusArtboard | OctopusLayerMaskGroup | OctopusLayerSoftMaskGroup
