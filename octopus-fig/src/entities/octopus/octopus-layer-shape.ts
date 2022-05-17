import { OctopusLayerBase } from './octopus-layer-base'

import type { Octopus } from '../../typings/octopus'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { LayerSpecifics, OctopusLayerParent } from './octopus-layer-base'

type OctopusLayerShapeOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerShape
}

export class OctopusLayerShape extends OctopusLayerBase {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerShape

  constructor(options: OctopusLayerShapeOptions) {
    super(options)
  }

  get sourceLayer(): SourceLayerShape {
    return this._sourceLayer
  }

  private get _fill(): Octopus['Fill'] {
    return {
      type: 'COLOR', // TODO
      // visible, // TODO
      // blendMode, // TODO
      color: { r: 1, g: 0, b: 0, a: 1 }, // TODO
    }
  }

  private get _pathRectangle(): Octopus['PathRectangle'] {
    const { x, y } = this.sourceLayer.size ?? { x: 0, y: 0 }
    return { type: 'RECTANGLE', rectangle: { x0: 0, y0: 0, x1: x, y1: y } }
  }

  private get _path(): Octopus['PathLike'] {
    if (this.sourceLayer.shapeType !== 'RECTANGLE') return ('TODO - ' + this._sourceLayer.shapeType) as any // TODO
    return this._pathRectangle
  }

  private get _shape(): Octopus['Shape'] {
    return {
      path: this._path,
      // fillRule: components['schemas']['FillRule'] // TODO
      fills: [this._fill],
      // strokes: components['schemas']['VectorStroke'][] // TODO
    }
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['ShapeLayer']> {
    return {
      type: 'SHAPE',
      shape: this._shape,
    }
  }

  convert(): Octopus['ShapeLayer'] | null {
    const common = this.convertBase()
    if (!common) return null

    const specific = this._convertTypeSpecific()
    if (!specific) return null

    return { ...common, ...specific }
  }
}
