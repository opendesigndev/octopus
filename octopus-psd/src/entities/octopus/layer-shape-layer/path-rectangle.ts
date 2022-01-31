import type { Octopus } from '../../../typings/octopus'
import { createDefaultTranslationMatrix } from '../../../utils/path'
import type { SourceLayerLayer } from '../../source/source-layer-layer'

export function mapPathRectangle(layer: SourceLayerLayer): Octopus['PathRectangle'] {
  const { width, height } = layer
  const rectangle = { x0: 0, y0: 0, x1: width, y1: height }
  const transform = createDefaultTranslationMatrix()
  return { type: 'RECTANGLE', rectangle, transform }
}
