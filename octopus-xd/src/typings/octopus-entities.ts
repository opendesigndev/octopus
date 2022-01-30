import OctopusArtboard from '../entities/octopus/octopus-artboard'
import OctopusEffectColorFill from '../entities/octopus/octopus-effect-color-fill'
import OctopusEffectGradientFill from '../entities/octopus/octopus-effect-gradient-fill'
import OctopusEffectImageFill from '../entities/octopus/octopus-effect-image-fill'
import OctopusLayerGroup from '../entities/octopus/octopus-layer-group'
import OctopusLayerMaskGroup from '../entities/octopus/octopus-layer-maskgroup'
import OctopusLayerShape from '../entities/octopus/octopus-layer-shape'


export type OctopusLayerParent = 
  | OctopusLayerGroup
  | OctopusArtboard
  | OctopusLayerShape
  | OctopusLayerMaskGroup

export type OctopusFill = 
  | OctopusEffectColorFill
  | OctopusEffectGradientFill
  | OctopusEffectImageFill