import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import { getMapped } from '@avocode/octopus-common/dist/utils/common'

import { logWarn } from '../../services/instances/misc'
import type { Octopus } from '../../typings/octopus'
import { createDefaultTranslationMatrix } from '../../utils/path'
import type { SourceLayerAdjustment } from '../source/source-layer-adjustment'
import { OctopusEffectFill } from './octopus-effect-fill'
import { LayerSpecifics, OctopusLayerBase, OctopusLayerParent } from './octopus-layer-base'

type OctopusLayerShapeAdjustmentAdapterOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerAdjustment
}

export class OctopusLayerShapeAdjustmentAdapter extends OctopusLayerBase {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerAdjustment

  static ADJUSTMENT_TYPE_MAP = {
    COLOR: 'SOLID_COLOR',
    GRADIENT: 'GRADIENT',
    IMAGE: 'PATTERN',
  } as const

  constructor(options: OctopusLayerShapeAdjustmentAdapterOptions) {
    super(options)
  }

  get sourceLayer(): SourceLayerAdjustment {
    return this._sourceLayer
  }

  get layerTranslation(): [number, number] {
    const { left, top } = this._sourceLayer.bounds
    return [left, top]
  }

  private get _path(): Octopus['PathLike'] {
    const { width, height } = this.sourceLayer.bounds
    const rectangle = { x0: 0, y0: 0, x1: width, y1: height }
    const transform = createDefaultTranslationMatrix()
    return { type: 'RECTANGLE', rectangle, transform }
  }

  @firstCallMemo()
  private get _fill(): Octopus['Fill'] | null {
    return new OctopusEffectFill({ parentLayer: this, fill: this.sourceLayer.fill }).convert()
  }

  @firstCallMemo()
  private get _fills(): Octopus['Fill'][] {
    const fill = this._fill
    return fill ? [fill] : []
  }

  private get _shape(): Octopus['Shape'] {
    return {
      fillRule: 'EVEN_ODD',
      path: this._path,
      fills: this._fills,
    }
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['ShapeLayer']> | null {
    const shape = this._shape
    if (shape === null) return null
    return {
      type: 'SHAPE',
      shape,
    } as const
  }

  private get _meta(): Octopus['LayerMeta'] {
    const fillType = this._fill?.type
    const adjustmentType = getMapped(fillType, OctopusLayerShapeAdjustmentAdapter.ADJUSTMENT_TYPE_MAP, undefined)
    if (!adjustmentType) {
      logWarn('Unknown Adjustment type', { fillType })
    }
    return { origin: { type: 'PHOTOSHOP_ADJUSTMENT_LAYER', adjustmentType } }
  }

  convert(): Octopus['ShapeLayer'] | null {
    const common = this.convertBase()
    if (!common) return null

    const specific = this._convertTypeSpecific()
    if (!specific) return null

    const meta = this._meta

    return {
      ...common,
      ...specific,
      meta,
    }
  }
}
