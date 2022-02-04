import { LayerSpecifics, OctopusLayerCommon, OctopusLayerParent } from './octopus-layer-common'
import type { SourceLayerLayer } from '../source/source-layer-layer'
import type { Octopus } from '../../typings/octopus'
import { mapFillImage } from './layer-shape-layer/fill'
import { OctopusPathLike } from './octopus-path-like'

type OctopusLayerShapeLayerAdapterOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerLayer
}

export class OctopusLayerShapeLayerAdapter extends OctopusLayerCommon {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerLayer

  constructor(options: OctopusLayerShapeLayerAdapterOptions) {
    super(options)
  }

  get layerTranslation(): [number, number] {
    const { left, top } = this._sourceLayer.bounds
    return [left, top]
  }

  private get _path(): Octopus['PathLike'] {
    return new OctopusPathLike({ sourceLayer: this._sourceLayer, parent: this }).convert()
  }

  private get _fills(): Octopus['Fill'][] {
    const fill = mapFillImage(this._sourceLayer)
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
