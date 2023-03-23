import type { OctopusArtboard } from '../entities/octopus/octopus-artboard.js'
import type { OctopusEffectFillColor } from '../entities/octopus/octopus-effect-fill-color.js'
import type { OctopusEffectFillGradient } from '../entities/octopus/octopus-effect-fill-gradient.js'
import type { OctopusEffectFillImage } from '../entities/octopus/octopus-effect-fill-image.js'
import type { OctopusLayerGroup } from '../entities/octopus/octopus-layer-group.js'
import type { OctopusLayerMaskGroup } from '../entities/octopus/octopus-layer-maskgroup.js'
import type { OctopusLayerShape } from '../entities/octopus/octopus-layer-shape.js'

export type OctopusLayerParent = OctopusLayerGroup | OctopusArtboard | OctopusLayerShape | OctopusLayerMaskGroup

export type OctopusFill = OctopusEffectFillColor | OctopusEffectFillGradient | OctopusEffectFillImage
