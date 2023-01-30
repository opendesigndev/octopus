import { lerpColor } from '@opendesign/octopus-common/dist/utils/color'
import { push } from '@opendesign/octopus-common/dist/utils/common'
import { invLerp, round } from '@opendesign/octopus-common/dist/utils/math'

import { convertBlendMode, convertColor, convertStop } from '../../utils/convert'
import { createMatrix, createPoint } from '../../utils/paper'

import type { Octopus } from '../../typings/octopus'
import type { RawStop } from '../../typings/raw'
import type { SourceTransform } from '../../typings/source'
import type { SourceLayerCommon } from '../source/source-layer-common'
import type { SourcePaint } from '../source/source-paint'

type OctopusFillOptions = {
  fill: SourcePaint
  parentLayer: SourceLayerCommon
}

export class OctopusFill {
  private _fill: SourcePaint
  private _parentLayer: SourceLayerCommon

  static convertFills(fills: SourcePaint[], parentLayer: SourceLayerCommon): Octopus['Fill'][] {
    return fills.reduce((fills: Octopus['Fill'][], fill: SourcePaint) => {
      const newFill = new OctopusFill({ fill, parentLayer }).convert()
      return newFill ? push(fills, newFill) : fills
    }, [])
  }

  constructor(options: OctopusFillOptions) {
    this._fill = options.fill
    this._parentLayer = options.parentLayer
  }

  get fillType(): Octopus['FillType'] | null {
    switch (this._fill.type) {
      case 'SOLID':
        return 'COLOR'
      case 'GRADIENT_LINEAR':
      case 'GRADIENT_RADIAL':
      case 'GRADIENT_ANGULAR':
      case 'GRADIENT_DIAMOND':
        return 'GRADIENT'
      case 'IMAGE':
        return 'IMAGE'
      default:
        return null
    }
  }

  get visible(): boolean {
    return this._fill.visible
  }

  get blendMode(): Octopus['BlendMode'] {
    return convertBlendMode(this._fill.blendMode)
  }

  get opacity(): number {
    return this._fill.opacity
  }

  private get _color(): Octopus['Color'] | null {
    return convertColor(this._fill.color, this.opacity)
  }

  private get _gradientStops(): Octopus['GradientColorStop'][] | null {
    const stops = this._fill.gradientStops.reduce((stops: Octopus['GradientColorStop'][], stop: RawStop) => {
      const newStop = convertStop(stop, this.opacity)
      return newStop ? push(stops, newStop) : stops
    }, [])
    if (!stops.length) return null

    if (this._gradientType === 'ANGULAR') {
      const firstStop = stops[0]
      const lastStop = stops[stops.length - 1]

      if (round(firstStop.position) === 0 && round(lastStop.position) === 1) return stops
      if (round(firstStop.position) === 0) return push(stops, { ...firstStop, position: 1 })
      if (round(lastStop.position) === 0) return [{ ...lastStop, position: 0 }, ...stops]

      const totalLen = firstStop.position + (1 - lastStop.position)
      const ratio = invLerp(0, totalLen, firstStop.position)
      const color = lerpColor(firstStop.color, lastStop.color, ratio)

      return [{ color, position: 0 }, ...stops, { color, position: 1 }]
    }

    return stops
  }

  private get _gradientType(): Octopus['FillGradient']['gradient']['type'] | null {
    switch (this._fill.type) {
      case 'GRADIENT_LINEAR':
        return 'LINEAR'
      case 'GRADIENT_RADIAL':
        return 'RADIAL'
      case 'GRADIENT_ANGULAR':
        return 'ANGULAR'
      case 'GRADIENT_DIAMOND':
        return 'DIAMOND'
      default:
        return null
    }
  }

  private get _gradient(): Octopus['FillGradient']['gradient'] | null {
    const type = this._gradientType
    if (type === null) return null
    const stops = this._gradientStops
    if (stops === null) return null
    return { type, stops }
  }

  private get _transform(): Octopus['Transform'] | null {
    const size = this._parentLayer.size
    if (size === null) return null
    const { x: width, y: height } = size

    const gradientTransform = this._fill.gradientTransform
    if (gradientTransform) {
      if (this._gradientType === 'LINEAR') {
        return createMatrix(gradientTransform)
          .scale(1 / width, 1 / height)
          .invert().values
      }

      const center = createPoint(0, 0)
      // const center = createPoint(-1, 1)
      const matrix = createMatrix(gradientTransform)
        .scale(2 / width, 2 / height, center)
        .invert()
      // .prepend(createMatrix([2, 0, 0, 2, 0, 0]))
      // .scale(width / 2, height / 2, center).values
      // .translate(0, -height / 2)

      // console.info()
      // console.info('width', width)
      // console.info('height', height)
      // console.info('before', matrix)
      // console.info('after', matrix.translate(0, height / 2))
      // console.info('after', matrix.translate(0, -height / 2))
      // console.info()
      // console.info()

      // return [a, b, c, d, tx, ty + height / 2] // TODO fix this for radial gradient
      return matrix.values
    }

    const positions = this._fill.gradientHandlePositions
    if (positions === null) return null
    const [P1, P2, P3] = positions

    const p1 = { x: P1.x * width, y: P1.y * height }
    const p2 = { x: P2.x * width, y: P2.y * height }
    const p3 = { x: P3.x * width, y: P3.y * height }

    const scaleX = p2.x - p1.x
    const skewY = p2.y - p1.y
    const skewX = p3.x - p1.x
    const scaleY = p3.y - p1.y
    const tx = p1.x
    const ty = p1.y
    return [scaleX, skewY, skewX, scaleY, tx, ty]
  }

  private get _gradientPositioning(): Octopus['FillPositioning'] | null {
    const layout = 'FILL'
    const origin = 'LAYER'
    const transform = this._transform
    if (transform === null) return null
    return { layout, origin, transform }
  }

  private get _imagePositioning(): Octopus['FillPositioning'] | null {
    const layout = this._fill.scaleMode ?? 'FILL'
    const origin = 'LAYER'

    if (layout === 'TILE') {
      const imageRef = this._fill.imageRef
      if (!imageRef) return null
      const imageSize = this._parentLayer.parentComponent.getImageSize(imageRef)
      if (!imageSize) return null

      const scalingFactor = this._fill.scalingFactor
      const { width, height } = imageSize

      const transform: SourceTransform = [width * scalingFactor, 0, 0, height * scalingFactor, 0, 0]
      return { layout, origin, transform }
    }

    const size = this._parentLayer.size
    if (!size) return null
    const { x, y } = size

    if (this._fill.imageTransform) {
      const transform = createMatrix(this._fill.imageTransform)
        .invert()
        .prepend(createMatrix([x, 0, 0, y, 0, 0])).values
      return { layout, origin, transform }
    }

    if (this._fill.rotation) {
      const transform = createMatrix([1, 0, 0, 1, 0, 0])
        .rotate(this._fill.rotation, 0.5, 0.5)
        .invert()
        .prepend(createMatrix([x, 0, 0, y, 0, 0])).values
      return { layout, origin, transform }
    }

    const transform: SourceTransform = [x, 0, 0, y, 0, 0]
    return { layout, origin, transform }
  }

  private get _fillColor(): Octopus['FillColor'] | null {
    const color = this._color
    if (!color) return null
    const visible = this.visible
    const blendMode = this.blendMode
    return { type: 'COLOR', visible, blendMode, color }
  }

  private get _fillGradient(): Octopus['FillGradient'] | null {
    const visible = this.visible
    const blendMode = this.blendMode
    const gradient = this._gradient
    if (gradient === null) return null
    const positioning = this._gradientPositioning
    if (positioning === null) return null
    return { type: 'GRADIENT', visible, blendMode, gradient, positioning }
  }

  private get _filterOpacity(): Octopus['ImageFilterOpacityMultiplier'] {
    return { type: 'OPACITY_MULTIPLIER', opacity: this.opacity }
  }

  private get _filterAdjustment(): Octopus['ImageFilterFigmaAdjust'] {
    const { exposure, contrast, saturation, temperature, tint, highlights, shadows } = this._fill.filters ?? {}
    const colorAdjustment = { hue: exposure, contrast, saturation, temperature, tint, highlights, shadows }
    return { type: 'FIGMA_COLOR_ADJUSTMENT', colorAdjustment }
  }

  private get _fillImage(): Octopus['FillImage'] | null {
    const imageRef = this._fill.imageRef
    if (!imageRef) return null

    const exportedPath = this._parentLayer.parentComponent.getImageExportedPath(imageRef)
    const image: Octopus['Image'] = exportedPath
      ? { ref: { type: 'PATH', value: exportedPath } }
      : { ref: { type: 'RESOURCE_REF', value: imageRef } }
    const visible = this.visible
    const blendMode = this.blendMode
    const positioning = this._imagePositioning
    if (positioning === null) return null
    const filters: Octopus['ImageFilter'][] = [this._filterOpacity, this._filterAdjustment]
    return { type: 'IMAGE', visible, blendMode, image, positioning, filters }
  }

  convert(): Octopus['Fill'] | null {
    switch (this.fillType) {
      case 'COLOR':
        return this._fillColor
      case 'GRADIENT':
        return this._fillGradient
      case 'IMAGE':
        return this._fillImage
      default:
        return null
    }
  }
}
