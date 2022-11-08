import { asBoolean, asNumber, asString } from '@opendesign/octopus-common/dist/utils/as'

import { DEFAULTS } from '../../utils/defaults'
import { createPathRectangle, createPoint, createSize } from '../../utils/paper'
import { SourceEffectFillImage } from '../source/source-effect-image-fill'

import type { Octopus } from '../../typings/octopus'
import type { RawFillImage } from '../../typings/source'
import type { OctopusBounds } from './octopus-bounds'
import type { OctopusLayerShape } from './octopus-layer-shape'

type OctopusEffectFillImageOptions = {
  source: SourceEffectFillImage
  effectBounds: OctopusBounds
  octopusLayer: OctopusLayerShape
}

type OctopusEffectFillImageFromRawOptions = {
  effect: RawFillImage
  effectBounds: OctopusBounds
  octopusLayer: OctopusLayerShape
}

export class OctopusEffectFillImage {
  private _source: SourceEffectFillImage
  private _effectBounds: OctopusBounds
  private _octopusLayer: OctopusLayerShape

  static TYPES = {
    cover: 'FILL',
    fill: 'STRETCH',
  } as const

  static fromRaw(options: OctopusEffectFillImageFromRawOptions): OctopusEffectFillImage {
    return new this({
      source: new SourceEffectFillImage(options),
      effectBounds: options.effectBounds,
      octopusLayer: options.octopusLayer,
    })
  }

  constructor(options: OctopusEffectFillImageOptions) {
    this._source = options.source
    this._effectBounds = options.effectBounds
    this._octopusLayer = options.octopusLayer
  }

  private _getScaleX(): number {
    if (typeof this._source.scaleX === 'number') return this._source.scaleX
    if (typeof this._source.scale === 'number') return this._source.scale
    return 1
  }

  private _getScaleY(): number {
    if (typeof this._source.scaleY === 'number') return this._source.scaleY
    if (typeof this._source.scale === 'number') return this._source.scale
    return 1
  }

  private _getTransformFill(): Octopus['Transform'] {
    const w = this._effectBounds.w
    const h = this._effectBounds.h
    const iw = asNumber(this._source.imageWidth, 0)
    const ih = asNumber(this._source.imageHeight, 0)
    const offsetX = asNumber(this._source.offsetX, 0)
    const offsetY = asNumber(this._source.offsetY, 0)
    const scaleX = this._getScaleX()
    const scaleY = this._getScaleY()
    const flipX = asBoolean(this._source.flipX, false)
    const flipY = asBoolean(this._source.flipY, false)
    const layerBox = createPathRectangle(createPoint(0, 0), createSize(w, h))
    const image = createPathRectangle(createPoint(0, 0), createSize(iw, ih))

    const pointsMap = {
      TOP_LEFT: image.segments[1].point,
      BOTTOM_LEFT: image.segments[0].point,
      TOP_RIGHT: image.segments[2].point,
    }

    const ratio = w / h > iw / ih ? w / iw : h / ih
    image.bounds.center = layerBox.bounds.center
    image.scale(ratio)
    image.scale((flipX ? -1 : 1) * scaleX, (flipY ? -1 : 1) * scaleY)
    const aspectRatio = (iw * h) / (ih * w)
    const aspectScaleX = Math.min(1 / aspectRatio, 1)
    const aspectScaleY = Math.min(aspectRatio, 1)
    image.translate(
      createPoint(
        (w / aspectScaleX) * offsetX + this._effectBounds.x,
        (h / aspectScaleY) * offsetY + this._effectBounds.y
      )
    )

    const [p1, p2, p3] = [pointsMap.TOP_LEFT, pointsMap.TOP_RIGHT, pointsMap.BOTTOM_LEFT]

    return [p2.x - p1.x, p2.y - p1.y, p3.x - p1.x, p3.y - p1.y, p1.x, p1.y]
  }

  private _getTransformStretch(): Octopus['Transform'] {
    const w = this._effectBounds.w
    const h = this._effectBounds.h
    const offsetX = asNumber(this._source.offsetX, 0)
    const offsetY = asNumber(this._source.offsetY, 0)
    const scaleX = this._getScaleX()
    const scaleY = this._getScaleY()
    const flipX = asBoolean(this._source.flipX, false)
    const flipY = asBoolean(this._source.flipY, false)
    const image = createPathRectangle(createPoint(0, 0), createSize(w, h))

    const pointsMap = {
      TOP_LEFT: image.segments[1].point,
      BOTTOM_LEFT: image.segments[0].point,
      TOP_RIGHT: image.segments[2].point,
    }

    image.scale((flipX ? -1 : 1) * scaleX, (flipY ? -1 : 1) * scaleY)
    image.translate(createPoint(w * offsetX, h * offsetY))

    const [p1, p2, p3] = [pointsMap.TOP_LEFT, pointsMap.TOP_RIGHT, pointsMap.BOTTOM_LEFT]

    return [p2.x - p1.x, p2.y - p1.y, p3.x - p1.x, p3.y - p1.y, p1.x, p1.y]
  }

  convert(): Octopus['Fill'] | null {
    const visible = this._source.type !== 'none'

    const octopusManifest = this._octopusLayer.parentArtboard?.converter.octopusManifest

    const uid = asString(this._source.uid)
    const imagePath = octopusManifest?.getExportedRelativeImagePathById(uid)

    const ref = {
      type: 'PATH',
      value: imagePath ?? uid,
    } as const

    const scaleBehavior = this._source.scaleBehavior

    const fillType = scaleBehavior ? OctopusEffectFillImage.TYPES[scaleBehavior] : DEFAULTS.EFFECTS.IMAGE_FILL_TYPE

    const transform = fillType === 'FILL' ? this._getTransformFill() : this._getTransformStretch()

    return {
      type: 'IMAGE' as const,
      visible,
      blendMode: DEFAULTS.BLEND_MODE,
      image: {
        ref,
      },
      positioning: {
        layout: fillType,
        origin: 'LAYER',
        transform,
      },
    }
  }
}
