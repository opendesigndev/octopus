import { push } from '@opendesign/octopus-common/dist/utils/common'
import first from 'lodash/first'

import { convertRectangle } from '../../utils/convert'
import { DEFAULTS } from '../../utils/defaults'
import { simplifyPathData } from '../../utils/paper'

import type { Octopus } from '../../typings/octopus'
import type { SourceGeometry } from '../../typings/source'
import type { SourceLayerContainer } from '../source/source-layer-container'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { SourceLayerText } from '../source/source-layer-text'

type SourceLayer = SourceLayerShape | SourceLayerText | SourceLayerContainer

type OctopusPathOptions = { sourceLayer: SourceLayer; isStroke?: boolean }

type SourceLayerOptions = { sourceLayer: SourceLayer; isTopLayer: boolean }
type SourceLayerShapeOptions = { sourceLayer: SourceLayerShape; isTopLayer: boolean }

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

  private _transform({ sourceLayer, isTopLayer }: SourceLayerOptions): number[] {
    return isTopLayer ? DEFAULTS.TRANSFORM : sourceLayer.transform ?? DEFAULTS.TRANSFORM
  }

  private _geometries(sourceLayer: SourceLayer): SourceGeometry[] | undefined {
    if (this._isStroke) return sourceLayer.strokeGeometry
    return sourceLayer.fillGeometry.length ? sourceLayer.fillGeometry : sourceLayer.strokeGeometry
  }

  private _firstGeometry(sourceLayer: SourceLayer): SourceGeometry | undefined {
    return first(this._geometries(sourceLayer) ?? [])
  }

  private _geometry(sourceLayer: SourceLayer): Octopus['PathGeometry'] {
    const geometries = this._geometries(sourceLayer)?.reduce(
      (paths: string[], cur: SourceGeometry) => push(paths, simplifyPathData(cur.path)),
      []
    )
    return geometries ? geometries.join(' ') : DEFAULTS.EMPTY_PATH
  }

  private _isRectangle(sourceLayer: SourceLayerShape): boolean {
    return sourceLayer.shapeType === 'RECTANGLE' && !sourceLayer.cornerRadii
  }

  private _getPathRectangle({ sourceLayer, isTopLayer }: SourceLayerOptions): Octopus['PathRectangle'] {
    const visible = sourceLayer.visible
    const transform = this._transform({ sourceLayer, isTopLayer })
    const size = sourceLayer.size ?? { x: 0, y: 0 }
    const rectangle = convertRectangle(size)
    const cornerRadius = sourceLayer.cornerRadius
    return { type: 'RECTANGLE', visible, transform, rectangle, cornerRadius }
  }

  private _getPathPath({ sourceLayer, isTopLayer }: SourceLayerOptions): Octopus['Path'] {
    const visible = sourceLayer.visible
    const transform = this._transform({ sourceLayer, isTopLayer })
    const meta = { sourceShape: this._sourceShape }
    const geometry = this._geometry(sourceLayer)
    return { type: 'PATH', visible, transform, meta, geometry }
  }

  private _getPathBool({ sourceLayer, isTopLayer }: SourceLayerShapeOptions): Octopus['CompoundPath'] {
    const op = sourceLayer.booleanOperation
    const visible = sourceLayer.visible
    const transform = this._transform({ sourceLayer, isTopLayer })
    const geometry = this._geometry(sourceLayer) || undefined
    const paths = sourceLayer.children
      .filter((sourceLayer): sourceLayer is SourceLayerShape => sourceLayer.type === 'SHAPE') // https://gitlab.avcd.cz/opendesign/octopus-converters/-/issues/9
      .map((sourceLayer) => this._getPath({ sourceLayer, isTopLayer: false }))
    return { type: 'COMPOUND', op, visible, transform, paths, geometry }
  }

  private _getPath({ sourceLayer, isTopLayer }: SourceLayerOptions): Octopus['PathLike'] {
    if (this._isStroke) return this._getPathPath({ sourceLayer, isTopLayer })
    if (sourceLayer.type === 'TEXT') return this._getPathPath({ sourceLayer, isTopLayer })
    if (sourceLayer.type !== 'SHAPE') return this._getPathRectangle({ sourceLayer, isTopLayer })
    if (this._isRectangle(sourceLayer)) return this._getPathRectangle({ sourceLayer, isTopLayer })
    if (sourceLayer.shapeType === 'BOOLEAN_OPERATION') return this._getPathBool({ sourceLayer, isTopLayer })
    return this._getPathPath({ sourceLayer, isTopLayer })
  }

  get fillRule(): Octopus['FillRule'] {
    return this._firstGeometry(this.sourceLayer)?.fillRule ?? DEFAULTS.WINDING_RULE
  }

  convert(): Octopus['PathLike'] {
    return this._getPath({ sourceLayer: this.sourceLayer, isTopLayer: true })
  }
}
