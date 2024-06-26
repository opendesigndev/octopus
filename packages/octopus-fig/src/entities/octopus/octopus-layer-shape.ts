import { OctopusFill } from './octopus-fill.js'
import { OctopusLayerBase } from './octopus-layer-base.js'
import { OctopusPath } from './octopus-path.js'
import { OctopusStroke } from './octopus-stroke.js'

import type { LayerSpecifics, OctopusLayerParent } from './octopus-layer-base.js'
import type { Octopus } from '../../typings/octopus.js'
import type { SourceLayerShape } from '../source/source-layer-shape.js'

type OctopusLayerShapeOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerShape
}

export class OctopusLayerShape extends OctopusLayerBase {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerShape
  protected _path: OctopusPath

  constructor(options: OctopusLayerShapeOptions) {
    super(options)
    this._path = new OctopusPath(options)
  }

  get sourceLayer(): SourceLayerShape {
    return this._sourceLayer
  }

  private get _fills(): Promise<Octopus['Fill'][]> {
    return OctopusFill.convertFills(this.sourceLayer.fills, this)
  }

  private get _strokes(): Promise<Octopus['VectorStroke'][]> {
    return OctopusStroke.convertStrokes(this.sourceLayer.strokes, this)
  }

  private async _shape(): Promise<Octopus['Shape']> {
    return {
      path: this._path.convert(),
      fillRule: this._path.fillRule,
      fills: await this._fills,
      strokes: await this._strokes,
    }
  }

  private async _convertTypeSpecific(): Promise<LayerSpecifics<Octopus['ShapeLayer']>> {
    return {
      type: 'SHAPE',
      shape: await this._shape(),
    }
  }

  async convert(): Promise<Octopus['ShapeLayer'] | null> {
    const common = this.convertBase()
    if (!common) return null

    const specific = await this._convertTypeSpecific()
    if (!specific) return null

    return { ...common, ...specific }
  }
}
