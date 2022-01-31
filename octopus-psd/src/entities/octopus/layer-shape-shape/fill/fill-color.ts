import type { Octopus } from '../../../../typings/octopus'
import { convertColor } from '../../../../utils/color'
import type { SourceShapeFill } from '../../../source/shape-fill'

export function convertFillColor(fill: SourceShapeFill | undefined): Octopus['FillColor'] {
  const color = convertColor(fill?.color)
  return { type: 'COLOR', color }
}
