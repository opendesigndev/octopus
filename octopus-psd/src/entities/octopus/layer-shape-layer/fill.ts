import type { Octopus } from '../../../typings/octopus'
import type { SourceLayerLayer } from '../../source/source-layer-layer'
import { convertImagePath } from '../../../utils/resource'

function mapImage(layer: SourceLayerLayer): Octopus['Image'] {
  const ref: Octopus['ImageRef'] = {
    type: 'RESOURCE',
    value: convertImagePath(layer?.imageName ?? ''),
  }
  return { ref }
}

function mapPositioning(layer: SourceLayerLayer): Octopus['FillPositioning'] {
  const transform: Octopus['Transform'] = [layer?.width, 0, 0, layer?.height, 0, 0]
  return { layout: 'FILL', origin: 'LAYER', transform }
}

export function mapFillImage(layer: SourceLayerLayer): Octopus['FillImage'] {
  const image = mapImage(layer)
  const positioning = mapPositioning(layer)
  return { type: 'IMAGE', image, positioning }
}
