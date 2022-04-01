import type { Octopus as OctopusRaw } from '@avocode/octopus-ts'

export type Octopus = OctopusRaw['schemas']

export interface OctopusLayerShapeAdapter {
  convert(): Octopus['ShapeLayer'] | null
}
