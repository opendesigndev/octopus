import type { OctopusLayerCommon } from '../../entities/octopus/octopus-layer-common'
import type { Octopus as OctopusRaw } from '@opendesign/octopus-ts'

export type Octopus = OctopusRaw['schemas']

export interface OctopusLayerShapeAdapter extends OctopusLayerCommon {
  convert(): Octopus['ShapeLayer'] | null
}
