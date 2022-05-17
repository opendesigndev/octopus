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

  private get _firstGeometry(): SourceGeometry | undefined {
    return [...this.sourceLayer.fillGeometry, ...this.sourceLayer.strokeGeometry][0]
  }

  private get _geometry(): Octopus['PathGeometry'] {
    return simplifyPathData(this._firstGeometry?.path ?? DEFAULTS.EMPTY_PATH)
  }

  private get _pathPath(): Octopus['Path'] {
    const meta = { sourceShape: this._sourceShape }
    const geometry = this._geometry
    return { type: 'PATH', meta, geometry }
  }

  private get _pathBool(): Octopus['CompoundPath'] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { type: 'COMPOUND', todo: 'TODO' } as any // TODO
  }

  private get _isRectangle(): boolean {
    return this.sourceLayer.shapeType === 'RECTANGLE' && !this.sourceLayer.cornerRadius
  }

  private get _path(): Octopus['PathLike'] {
    if (this._isRectangle) return this._pathRectangle
    if (this.sourceLayer.shapeType === 'BOOLEAN_OPERATION') return this._pathBool
    return this._pathPath
  }

  private get _fillRule(): Octopus['FillRule'] {
    return this._firstGeometry?.fillRule ?? DEFAULTS.WINDING_RULE
  }

  private get _shape(): Octopus['Shape'] {
    return {
      path: this._path,
      fillRule: this._fillRule,
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
