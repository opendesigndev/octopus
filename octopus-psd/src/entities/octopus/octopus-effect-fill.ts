import type { Octopus } from '../../typings/octopus'
import { getMapped } from '@avocode/octopus-common/dist/utils/common'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'
import { OctopusEffectFillColor } from './octopus-effect-fill-color'
import { OctopusEffectFillGradient } from './octopus-effect-fill-gradient'
import { OctopusEffectFillImage } from './octopus-effect-fill-image'
import type { SourceShapeFill } from '../source/source-effect-fill'

type OctopusFillOptions = {
  parent: OctopusLayerShapeShapeAdapter
  fill: SourceShapeFill
}

export class OctopusEffectFill {
  protected _parent: OctopusLayerShapeShapeAdapter
  protected _fill: SourceShapeFill

  constructor(options: OctopusFillOptions) {
    this._parent = options.parent
    this._fill = options.fill
  }

  get fill(): SourceShapeFill {
    return this._fill
  }

  get fillType(): Octopus['FillType'] {
    if (this.fill.pattern) return 'IMAGE'
    if (this.fill.gradient) return 'GRADIENT'
    return 'COLOR'
  }

  convert(): Octopus['Fill'] {
    const fill = this.fill
    const parent = this._parent
    if (this.fillType === 'GRADIENT') return new OctopusEffectFillGradient({ parent, fill }).convert()
    if (this.fillType === 'IMAGE') return new OctopusEffectFillImage({ parent }).convert()
    return new OctopusEffectFillColor({ fill }).convert()
  }
}
