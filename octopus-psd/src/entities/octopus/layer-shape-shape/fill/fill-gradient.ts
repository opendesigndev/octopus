import type { ElementOf } from '../../../../typings/helpers'
import type { Octopus } from '../../../../typings/octopus'
import { convertColor } from '../../../../utils/color'
import { getMapped } from '../../../../utils/common'
import type { SourceShapeFill, SourceShapeGradientColor } from '../../../source/shape-fill'
import type { SourceLayerShape } from '../../../source/source-layer-shape'
import type { SourceFillGradientType } from '../../../source/types'
import { getLinearGradientPoints, scaleLineSegment } from '../../../../utils/gradient'

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

type FillGradientStop = ElementOf<Octopus['FillGradient']['gradient']['stops']>

function mapGradientStop(stop: SourceShapeGradientColor): FillGradientStop {
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

type TransformLinearParams = { angle: number; scale: number; inverse: boolean; width: number; height: number }
function getTransformLinear({ angle, scale, inverse, width, height }: TransformLinearParams): Octopus['Transform'] {
  const [P1, P2] = getLinearGradientPoints({ angle, inverse })

  const [SP1, SP2] = scaleLineSegment(P1, P2, scale, { x: 0.5, y: 0.5 })

  const p1 = { x: width * SP1.x, y: height * SP1.y }
  const p2 = { x: width * SP2.x, y: height * SP2.y }

  const scaleX = p2.x - p1.x
  const skewY = p2.y - p1.y
  const skewX = p1.y - p2.y
  const scaleY = p2.x - p1.x
  const tx = p1.x
  const ty = p1.y

  return [scaleX, skewY, skewX, scaleY, tx, ty]
}

function mapPositioning(layer: SourceLayerShape): Octopus['FillPositioning'] {
  const { width, height } = layer
  const { angle, scale, reverse } = layer.fill

  const transform = getTransformLinear({ width, height, scale, angle, inverse: reverse }) // TODO other gradient types

  return {
    layout: 'FILL',
    origin: 'LAYER',
    transform,
  }
}

export function convertFillGradient(layer: SourceLayerShape): Octopus['FillGradient'] {
  const gradient = mapGradient(layer.fill)
  const positioning = mapPositioning(layer)
  return { type: 'GRADIENT', gradient, positioning }
}
