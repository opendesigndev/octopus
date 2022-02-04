import { LayerSpecifics, OctopusLayerCommon, OctopusLayerParent } from './octopus-layer-common'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { Octopus } from '../../typings/octopus'
import { OctopusPathLike } from './octopus-path-like'
import { OctopusFill } from './layer-shape-shape/fill/fill'

type OctopusLayerShapeShapeAdapterOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerShape
}

export class OctopusLayerShapeShapeAdapter extends OctopusLayerCommon {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerShape

  constructor(options: OctopusLayerShapeShapeAdapterOptions) {
    super(options)
  }

  get layerTranslation(): [number, number] {
    const { left, top } = this._sourceLayer.pathBounds
    return [left, top]
  }

  private get _path(): Octopus['PathLike'] {
    return new OctopusPathLike({ sourceLayer: this._sourceLayer, parent: this }).convert()
  }

  private get _fills(): Octopus['Fill'][] {
    const fill = new OctopusFill({ sourceLayer: this._sourceLayer, parent: this }).convert()
    return [fill]
  }

  private get _shapes(): Octopus['Shape'][] {
    const fillShape: Octopus['Shape'] = {
      purpose: 'BODY',
      fillRule: 'EVEN_ODD',
      path: this._path,
      fills: this._fills,
      // ...this.shapeEffects.convert() // TODO
    }
    return [fillShape]
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['ShapeLayer']> {
    return {
      type: 'SHAPE',
      shapes: this._shapes,
    } as const
  }

  convert(): Octopus['ShapeLayer'] | null {
    const common = this.convertCommon()
    if (!common) return null

    return {
      ...common,
      ...this._convertTypeSpecific(),
    }
  }
}
