import SourceArtboard from './source-artboard'

import type SourceLayerGroup from './source-layer-group'
import type { RawLayer, RawResourcesExtGState, RawGraphicsState, RawGraphicsStateMatrix } from '../typings/source'
import type SourceLayerXObject from './source-layer-x-object'
import type { Nullable } from '../typings/helpers'
import type SourceResources from './source-resources'
import type SourceLayerShape from './source-layer-x-object'

export type SourceLayerParent = SourceLayerGroup | SourceArtboard | SourceLayerXObject | SourceLayerShape

type SourceLayerCommonOptions = {
  parent: SourceLayerParent
  rawValue: RawLayer
  path: number[]
}
type LayerType = 'TextGroup' | 'MarkedContext' | 'Path' | 'XObject'

export default class SourceLayerCommon {
  protected _parent: SourceLayerParent
  protected _rawValue: RawLayer
  protected _path: number[]

  constructor(options: SourceLayerCommonOptions) {
    this._path = options.path
    this._rawValue = options.rawValue
    this._parent = options.parent
  }

  get path(): number[] {
    return this._path
  }

  get type(): Nullable<LayerType> {
    return this._rawValue.Type
  }

  get raw(): RawLayer {
    return this._rawValue
  }

  get parentArtboard(): SourceArtboard | null {
    if (!this._parent) return null

    const parent = this._parent as SourceLayerGroup | SourceArtboard
    return parent instanceof SourceArtboard ? parent : parent.parentArtboard
  }

  get resources(): Nullable<SourceResources> {
    return this.parentArtboard?.resources
  }

  get parentArtboardDimensions(): { width: number; height: number } {
    return this.parentArtboard?.dimensions || { width: 0, height: 0 }
  }

  get graphicsState(): Nullable<RawGraphicsState> {
    //as graphicsState is obtained differently in source-layer-text, we overload this method there
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawValue: any = this._rawValue
    return rawValue.GraphicsState
  }

  get extGState(): Nullable<RawResourcesExtGState[string]> {
    const specifiedParameters = this.graphicsState?.SpecifiedParameters || ''
    return this._parent.resources?.ExtGState?.[specifiedParameters]
  }

  get blendMode(): Nullable<string> {
    return this.extGState?.BM
  }

  get opacity(): Nullable<number> {
    return this.extGState?.CA
  }

  get transformMatrix(): RawGraphicsStateMatrix {
    const rawCtm: RawGraphicsStateMatrix = this.graphicsState?.CTM ?? [1, 0, 0, 1, 0, 0]
    const inversedCtm = [...rawCtm]
    inversedCtm[5] = -rawCtm[5]

    return inversedCtm as RawGraphicsStateMatrix
  }
}
