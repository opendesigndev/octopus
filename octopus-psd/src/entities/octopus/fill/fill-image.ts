import type { Octopus } from '../../../typings/octopus'
import type { SourceShapeFill } from '../../source/shape-fill'

export function convertFillImage(fill: SourceShapeFill | undefined): Octopus['FillImage'] {
  return { type: 'IMAGE' } as Octopus['FillImage'] // TODO
}
