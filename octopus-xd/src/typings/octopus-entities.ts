import OctopusArtboard from '../entities/octopus/octopus-artboard'
import OctopusEffectFillColor from '../entities/octopus/octopus-effect-fill-color'
import OctopusEffectFillGradient from '../entities/octopus/octopus-effect-fill-gradient'
import OctopusEffectFillImage from '../entities/octopus/octopus-effect-fill-image'
import OctopusLayerGroup from '../entities/octopus/octopus-layer-group'
import OctopusLayerMaskGroup from '../entities/octopus/octopus-layer-maskgroup'
import OctopusLayerShape from '../entities/octopus/octopus-layer-shape'


export type OctopusLayerParent =
  | OctopusLayerGroup
  | OctopusArtboard
  | OctopusLayerShape
  | OctopusLayerMaskGroup

export type OctopusFill =
  | OctopusEffectFillColor
  | OctopusEffectFillGradient
  | OctopusEffectFillImage