import type { Octopus } from '../../typings/octopus'
import { OctopusEffectFillColor } from './octopus-effect-fill-color'
import { OctopusEffectFillGradient } from './octopus-effect-fill-gradient'
import { OctopusEffectFillImage } from './octopus-effect-fill-image'
import type { SourceEffectFill } from '../source/source-effect-fill'
import path from 'path'
import { FOLDER_IMAGES, FOLDER_PATTERNS } from '../../utils/const'
import { createMatrix } from '../../utils/paper-factories'
import { logWarn } from '../../services/instances/misc'
import type { SourceBounds } from '../../typings/source'
import type { OctopusArtboard } from './octopus-artboard'
import type { OctopusLayerBase } from './octopus-layer-base'

type OctopusFillOptions = {
  parentLayer: OctopusLayerBase
  fill: SourceEffectFill
}

export class OctopusEffectFill {
  protected _parentLayer: OctopusLayerBase
  protected _fill: SourceEffectFill

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

  get imagePath(): string {
    const imageName = `${this._fill.pattern?.ID}.png`
    return path.join(FOLDER_IMAGES, FOLDER_PATTERNS, imageName)
  }

  private get _offset(): [x: number, y: number] {
    const { width, height } = this._sourceLayerBounds
    const { x, y } = this._fill?.offset(width, height)
    return [x, y]
  }

  get imageTransform(): Octopus['Transform'] | null {
    const imagePath = this.imagePath
    const images = this._parentArtboard.sourceDesign.images
    const { width, height } = images.find((img) => img.path === imagePath) ?? {}
    if (width === undefined || height === undefined) {
      logWarn('Unknown image', { imagePath })
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
        return new OctopusEffectFillImage({
          imagePath: this.imagePath,
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
