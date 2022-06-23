import { convertRectangle } from '../../utils/convert'
import { DEFAULTS } from '../../utils/defaults'
import { simplifyPathData } from '../../utils/paper'

import type { Octopus } from '../../typings/octopus'
import type { SourceGeometry } from '../../typings/source'
import type { SourceLayerFrame } from '../source/source-layer-frame'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { SourceLayerText } from '../source/source-layer-text'

type SourceLayer = SourceLayerShape | SourceLayerText | SourceLayerFrame

type OctopusPathOptions = { sourceLayer: SourceLayer; isStroke?: boolean }

type PrivateOptions = { sourceLayer: SourceLayer; isTopLayer: boolean }
type PrivateShapeOptions = { sourceLayer: SourceLayerShape; isTopLayer: boolean }

export class OctopusPath {
  private _sourceLayer: SourceLayer
  private _isStroke: boolean

  constructor(options: OctopusPathOptions) {
    this._sourceLayer = options.sourceLayer
    this._isStroke = options.isStroke ?? false
  }

  get sourceLayer(): SourceLayer {
    return this._sourceLayer
  }

  private get _sourceShape(): 'LINE' | 'TRIANGLE' | 'RECTANGLE' | 'POLYGON' | 'ELLIPSE' | undefined {
    if (this.sourceLayer.type !== 'SHAPE') return undefined
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

  private _transform({ sourceLayer, isTopLayer }: PrivateOptions): number[] {
    return isTopLayer ? DEFAULTS.TRANSFORM : sourceLayer.transform ?? DEFAULTS.TRANSFORM
  }

  private _firstGeometry(sourceLayer: SourceLayer): SourceGeometry | undefined {
    return this._isStroke
      ? sourceLayer.strokeGeometry[0] ?? sourceLayer.fillGeometry[0]
      : sourceLayer.fillGeometry[0] ?? sourceLayer.strokeGeometry[0]
  }

  private _geometry(sourceLayer: SourceLayer): Octopus['PathGeometry'] {
    const path = this._firstGeometry(sourceLayer)?.path
    return path ? simplifyPathData(path) : DEFAULTS.EMPTY_PATH
  }

  private _isRectangle(sourceLayer: SourceLayerShape): boolean {
    return sourceLayer.shapeType === 'RECTANGLE'
  }

  private _pathRectangle({ sourceLayer, isTopLayer }: PrivateOptions): Octopus['PathRectangle'] {
    const visible = sourceLayer.visible
    const transform = this._transform({ sourceLayer, isTopLayer })
    const size = sourceLayer.size ?? { x: 0, y: 0 }
    const rectangle = convertRectangle(size)
    const cornerRadius = sourceLayer.cornerRadius
    return { type: 'RECTANGLE', visible, transform, rectangle, cornerRadius }
  }

  private _pathPath({ sourceLayer, isTopLayer }: PrivateOptions): Octopus['Path'] {
    const visible = sourceLayer.visible
    const transform = this._transform({ sourceLayer, isTopLayer })
    const meta = { sourceShape: this._sourceShape }
    const geometry = this._geometry(sourceLayer)
    return { type: 'PATH', visible, transform, meta, geometry }
  }

  private _pathBool({ sourceLayer, isTopLayer }: PrivateShapeOptions): Octopus['CompoundPath'] {
    const op = sourceLayer.booleanOperation
    const visible = sourceLayer.visible
    const transform = this._transform({ sourceLayer, isTopLayer })
    const paths = sourceLayer.children.map((sourceLayer) => this._path({ sourceLayer, isTopLayer: false }))
    return { type: 'COMPOUND', op, visible, transform, paths }
  }

  private _path({ sourceLayer, isTopLayer }: PrivateOptions): Octopus['PathLike'] {
    if (sourceLayer.type === 'TEXT') return this._pathPath({ sourceLayer, isTopLayer })
    if (sourceLayer.type === 'FRAME') return this._pathRectangle({ sourceLayer, isTopLayer })
    if (this._isRectangle(sourceLayer)) return this._pathRectangle({ sourceLayer, isTopLayer })
    if (sourceLayer.shapeType === 'BOOLEAN_OPERATION') return this._pathBool({ sourceLayer, isTopLayer })
    return this._pathPath({ sourceLayer, isTopLayer })
  }

  get fillRule(): Octopus['FillRule'] {
    return this._firstGeometry(this.sourceLayer)?.fillRule ?? DEFAULTS.WINDING_RULE
  }

  convert(): Octopus['PathLike'] {
    return this._path({ sourceLayer: this.sourceLayer, isTopLayer: true })
  }
}
