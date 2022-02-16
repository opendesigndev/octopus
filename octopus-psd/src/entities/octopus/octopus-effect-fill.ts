import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'
import { OctopusEffectFillColor } from './octopus-effect-fill-color'
import { OctopusEffectFillGradient } from './octopus-effect-fill-gradient'
import { OctopusEffectFillImage } from './octopus-effect-fill-image'
import type { SourceEffectFill } from '../source/source-effect-fill'
import path from 'path'
import { FOLDER_IMAGES, FOLDER_PATTERNS } from '../../utils/const'
import { createMatrix } from '../../utils/paper-factories'

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

  get imageTransform(): Octopus['Transform'] {
    const width = 300 // TODO
    const height = 300 // TODO

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
      case 'IMAGE':
        return new OctopusEffectFillImage({
          parent,
          imagePath: this.imagePath,
          transform: this.imageTransform,
          layout: 'TILE',
          origin: 'ARTBOARD',
        }).convert()
      case 'COLOR':
        return new OctopusEffectFillColor({ fill }).convert()
      default:
        return null
    }
  }
}
