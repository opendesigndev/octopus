import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'
import { OctopusEffectFillColor } from './octopus-effect-fill-color'
import { OctopusEffectFillGradient } from './octopus-effect-fill-gradient'
import { OctopusEffectFillImage } from './octopus-effect-fill-image'
import type { SourceEffectFill } from '../source/source-effect-fill'
import path from 'path'
import { FOLDER_IMAGES, FOLDER_PATTERNS } from '../../utils/const'
import { createMatrix } from '../../utils/paper-factories'
import { logWarn } from '../../services/instances/misc'

type OctopusFillOptions = {
  parent: OctopusLayerShapeShapeAdapter
  fill: SourceEffectFill
}

export class OctopusEffectFill {
  protected _parent: OctopusLayerShapeShapeAdapter
  protected _fill: SourceEffectFill

  constructor(options: OctopusFillOptions) {
    this._parent = options.parent
    this._fill = options.fill
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

  get imageTransform(): Octopus['Transform'] | null {
    const images = this._parent.parentArtboard.sourceDesign.images
    const { width, height } = images.find((img) => img.path === this.imagePath) ?? {}
    if (width === undefined || height === undefined) {
      logWarn('Unknown image', { imagePath: this.imagePath })
      return null
    }
    const matrix = createMatrix(width, 0, 0, height, 0, 0)
    matrix.scale(this._fill.scale)
    matrix.rotate(-this._fill.angle, 0, 0)
    return matrix.values
  }

  convert(): Octopus['Fill'] | null {
    const fill = this._fill
    const parent = this._parent
    switch (this.fillType) {
      case 'GRADIENT':
        return new OctopusEffectFillGradient({ parent, fill }).convert()
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
        return new OctopusEffectFillColor({ color }).convert()
      }
      default:
        return null
    }
  }
}
