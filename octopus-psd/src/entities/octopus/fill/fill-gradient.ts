import type { Octopus } from '../../../typings/octopus'
import type { SourceShapeFill } from '../../source/shape-fill'

export function convertFillGradient(fill: SourceShapeFill | undefined): Octopus['FillGradient'] {
  return { type: 'GRADIENT' } as Octopus['FillGradient'] // TODO
}
