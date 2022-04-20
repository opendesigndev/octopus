import type OctopusArtboard from '../entities/octopus/octopus-artboard'
import type OctopusEffectFillColor from '../entities/octopus/octopus-effect-fill-color'
import type OctopusEffectFillGradient from '../entities/octopus/octopus-effect-fill-gradient'
import type OctopusEffectFillImage from '../entities/octopus/octopus-effect-fill-image'
import type OctopusLayerGroup from '../entities/octopus/octopus-layer-group'
import type OctopusLayerMaskGroup from '../entities/octopus/octopus-layer-maskgroup'
import type OctopusLayerShape from '../entities/octopus/octopus-layer-shape'

export type OctopusLayerParent = OctopusLayerGroup | OctopusArtboard | OctopusLayerShape | OctopusLayerMaskGroup

export type OctopusFill = OctopusEffectFillColor | OctopusEffectFillGradient | OctopusEffectFillImage
