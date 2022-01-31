import type { Octopus } from '../../../../typings/octopus'
import { convertImagePath } from '../../../../utils/resource'
import type { SourceLayerShape } from '../../../source/source-layer-shape'

function mapImage(layer: SourceLayerShape): Octopus['Image'] {
  const ref: Octopus['ImageRef'] = {
    type: 'RESOURCE',
    value: convertImagePath(layer?.imageName ?? ''),
  }
  return { ref }
}

function mapPositioning(layer: SourceLayerShape): Octopus['FillPositioning'] {
  const transform: Octopus['Transform'] = [layer?.width, 0, 0, layer?.height, 0, 0]
  return { layout: 'FILL', origin: 'LAYER', transform }
}

export function convertFillImage(layer: SourceLayerShape): Octopus['FillImage'] {
  const image = mapImage(layer)
  const positioning = mapPositioning(layer)
  return { type: 'IMAGE', image, positioning }
}
