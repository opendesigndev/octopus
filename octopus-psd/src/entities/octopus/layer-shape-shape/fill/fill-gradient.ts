import type { ElementOf } from '../../../../typings/helpers'
import type { Octopus } from '../../../../typings/octopus'
import { convertColor } from '../../../../utils/color'
import { getMapped } from '../../../../utils/common'
import type { SourceShapeFill, SourceShapeGradientColor } from '../../../source/shape-fill'
import type { SourceLayerShape } from '../../../source/source-layer-shape'
import type { SourceFillGradientType } from '../../../source/types'

const FILL_GRADIENT_TYPE_MAP = {
  linear: 'LINEAR',
  radial: 'RADIAL',
  Angl: 'ANGULAR',
  Dmnd: 'DIAMOND',
} as const

function mapGradientType(type: SourceFillGradientType | undefined): Octopus['FillGradient']['gradient']['type'] {
  const result = getMapped(type, FILL_GRADIENT_TYPE_MAP, undefined)
  if (!result) {
    // this._parent.converter?.logWarn('Unknown Fill Gradient type', { type })
    return 'LINEAR'
  }
  return result
}

type FillGradientStops = ElementOf<Octopus['FillGradient']['gradient']['stops']>

function mapGradientStop(stop: SourceShapeGradientColor): FillGradientStops {
  const color = convertColor(stop?.color)
  const position = stop.location / 4096
  return { color, position }
}

function mapGradientStops(colors: SourceShapeGradientColor[] = []): Octopus['FillGradient']['gradient']['stops'] {
  return colors.map(mapGradientStop)
}

function mapGradient(fill: SourceShapeFill): Octopus['FillGradient']['gradient'] {
  const type = mapGradientType(fill?.type)
  const stops = mapGradientStops(fill?.gradient.colors)
  return { type, stops }
}

function mapPositioning(layer: SourceLayerShape): Octopus['FillPositioning'] {
  const { width, height } = layer

  // TODO
  // TODO
  // TODO

  return {
    layout: 'FILL',
    origin: 'LAYER',
    transform: [width, 0, 0, height, 0, 0],
  }
}

export function convertFillGradient(layer: SourceLayerShape): Octopus['FillGradient'] {
  const gradient = mapGradient(layer.fill)
  const positioning = mapPositioning(layer)
  return { type: 'GRADIENT', gradient, positioning }
}
