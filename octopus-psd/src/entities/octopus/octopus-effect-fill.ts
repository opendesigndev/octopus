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

  get fill(): SourceEffectFill {
    return this._fill
  }

  get fillType(): Octopus['FillType'] | null {
    if (this.fill.pattern) return 'IMAGE'
    if (this.fill.gradient) return 'GRADIENT'
    if (this.fill.color) return 'COLOR'
    return null
  }

  get imagePath(): string {
    const imageName = `${this.fill.pattern?.ID}.png`
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
    matrix.scale(this.fill.scale)
    matrix.rotate(-this.fill.angle, 0, 0)
    return matrix.values
  }

  convert(): Octopus['Fill'] | null {
    const fill = this.fill
    const parent = this._parent
    switch (this.fillType) {
      case 'GRADIENT':
        return new OctopusEffectFillGradient({ parent, fill }).convert()
      case 'IMAGE': {
        const transform = this.imageTransform
        if (transform === null) return null
        return new OctopusEffectFillImage({
          parent,
          imagePath: this.imagePath,
          transform,
          layout: 'TILE',
          origin: 'ARTBOARD',
        }).convert()
      }
      case 'COLOR':
        return new OctopusEffectFillColor({ fill }).convert()
      default:
        return null
    }
  }
}
