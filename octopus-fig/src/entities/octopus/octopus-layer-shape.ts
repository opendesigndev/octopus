import { DEFAULTS } from '../../utils/defaults'
import { simplifyPathData } from '../../utils/paper'
import { OctopusLayerBase } from './octopus-layer-base'

import type { Octopus } from '../../typings/octopus'
import type { SourceGeometry } from '../../typings/source'
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

  private get _fills(): Octopus['Fill'][] {
    return [
      {
        type: 'COLOR', // TODO
        // visible, // TODO
        // blendMode, // TODO
        color: { r: 1, g: 0, b: 0, a: 1 }, // TODO
      },
    ]
  }

  private get _strokes(): Octopus['VectorStroke'][] {
    return [] // TODO
  }

  private get _sourceShape(): 'LINE' | 'TRIANGLE' | 'RECTANGLE' | 'POLYGON' | 'ELLIPSE' | undefined {
    switch (this.sourceLayer.shapeType) {
      case 'RECTANGLE':
        return 'RECTANGLE'
      case 'LINE':
        return 'LINE'
      case 'ELLIPSE':
        return 'ELLIPSE'
      case 'REGULAR_POLYGON':
      case 'STAR':
        return 'POLYGON'
      default:
        return undefined
    }
  }

  get transform(): number[] {
    return DEFAULTS.TRANSFORM
  }

  private _transform(sourceLayer: SourceLayerShape): number[] {
    return sourceLayer.transform ?? DEFAULTS.TRANSFORM
  }

  private _firstGeometry(sourceLayer: SourceLayerShape): SourceGeometry | undefined {
    return [...sourceLayer.fillGeometry, ...sourceLayer.strokeGeometry][0]
  }

  private _geometry(sourceLayer: SourceLayerShape): Octopus['PathGeometry'] {
    return simplifyPathData(this._firstGeometry(sourceLayer)?.path ?? DEFAULTS.EMPTY_PATH)
  }

  private _isRectangle(sourceLayer: SourceLayerShape): boolean {
    return sourceLayer.shapeType === 'RECTANGLE' && !sourceLayer.cornerRadius
  }

  private _pathRectangle(sourceLayer: SourceLayerShape): Octopus['PathRectangle'] {
    const visible = sourceLayer.visible
    const transform = this._transform(sourceLayer)
    const { x, y } = sourceLayer.size ?? { x: 0, y: 0 }
    return { type: 'RECTANGLE', visible, transform, rectangle: { x0: 0, y0: 0, x1: x, y1: y } }
  }

  private _pathPath(sourceLayer: SourceLayerShape): Octopus['Path'] {
    const visible = sourceLayer.visible
    const transform = this._transform(sourceLayer)
    const meta = { sourceShape: this._sourceShape }
    const geometry = this._geometry(sourceLayer)
    return { type: 'PATH', visible, transform, meta, geometry }
  }

  private _pathBool(sourceLayer: SourceLayerShape): Octopus['CompoundPath'] {
    const op = sourceLayer.booleanOperation
    const visible = sourceLayer.visible
    const transform = this._transform(sourceLayer)
    const paths = sourceLayer.layers.map((layer) => this._path(layer))
    return { type: 'COMPOUND', op, visible, transform, paths }
  }

  private _path(sourceLayer: SourceLayerShape): Octopus['PathLike'] {
    if (this._isRectangle(sourceLayer)) return this._pathRectangle(sourceLayer)
    if (sourceLayer.shapeType === 'BOOLEAN_OPERATION') return this._pathBool(sourceLayer)
    return this._pathPath(sourceLayer)
  }

  private get _fillRule(): Octopus['FillRule'] {
    return this._firstGeometry(this.sourceLayer)?.fillRule ?? DEFAULTS.WINDING_RULE
  }

  private get _shape(): Octopus['Shape'] {
    return {
      path: this._path(this.sourceLayer),
      fillRule: this._fillRule,
      fills: this._fills,
      strokes: this._strokes,
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
