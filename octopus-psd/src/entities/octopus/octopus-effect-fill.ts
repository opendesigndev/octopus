import { logWarn } from '../../services/instances/misc'
import type { Octopus } from '../../typings/octopus'
import type { SourceBounds } from '../../typings/source'
import { convertOffset } from '../../utils/convert'
import { createMatrix } from '../../utils/paper-factories'
import type { SourceImage } from '../source/source-design'
import type { SourceEffectFill } from '../source/source-effect-fill'
import type { OctopusArtboard } from './octopus-artboard'
import { OctopusEffectFillColor } from './octopus-effect-fill-color'
import { OctopusEffectFillGradient } from './octopus-effect-fill-gradient'
import { OctopusEffectFillImage } from './octopus-effect-fill-image'
import type { OctopusLayerBase } from './octopus-layer-base'

type OctopusFillOptions = {
  parentLayer: OctopusLayerBase
  fill: SourceEffectFill
}

export class OctopusEffectFill {
  private _parentLayer: OctopusLayerBase
  private _fill: SourceEffectFill

  constructor(options: OctopusFillOptions) {
    this._parentLayer = options.parentLayer
    this._fill = options.fill
  }

  private get _parentArtboard(): OctopusArtboard {
    return this._parentLayer.parentArtboard
  }

  private get _sourceLayerBounds(): SourceBounds {
    return this._parentLayer.sourceLayer.bounds
  }

  get fillType(): Octopus['FillType'] | null {
    if (this._fill.pattern) return 'IMAGE'
    if (this._fill.gradient) return 'GRADIENT'
    if (this._fill.color) return 'COLOR'
    return null
  }

  private get _imageName(): string {
    return `${this._fill?.pattern?.ID}.png`
  }

  private get _imagePath(): string | undefined {
    return this._parentLayer.parentArtboard.converter.octopusManifest.getExportedRelativeImageByName(this._imageName)
  }

  private get _image(): SourceImage | undefined {
    return this._parentArtboard.sourceDesign.getImageByName(this._imageName)
  }

  private get _offset(): [x: number, y: number] {
    const { width, height } = this._sourceLayerBounds
    const { x, y } = convertOffset(this._fill?.offset, width, height)
    return [x, y]
  }

  get imageTransform(): Octopus['Transform'] | null {
    const image = this._image
    const { width, height } = image ?? {}
    if (width === undefined || height === undefined) {
      logWarn('Unknown image', { image, id: this._fill?.pattern?.ID })
      return null
    }
    const matrix = createMatrix(width, 0, 0, height, ...this._offset)
    matrix.scale(this._fill.scale)
    matrix.rotate(-this._fill.angle, 0, 0)
    return matrix.values
  }

  convert(): Octopus['Fill'] | null {
    const fill = this._fill
    switch (this.fillType) {
      case 'GRADIENT': {
        const parentLayer = this._parentLayer
        return new OctopusEffectFillGradient({ parentLayer, fill }).convert()
      }
      case 'IMAGE': {
        const transform = this.imageTransform
        if (transform === null) return null
        const imagePath = this._imagePath
        if (imagePath === undefined) return null
        return new OctopusEffectFillImage({
          imagePath,
          transform,
          layout: 'TILE',
          origin: 'ARTBOARD',
        }).convert()
      }
      case 'COLOR': {
        const color = fill.color
        if (color === null) return null
        const opacity = fill.opacity * this._parentLayer.fillOpacity
        return new OctopusEffectFillColor({ color, opacity }).convert()
      }
      default:
        return null
    }
  }
}
