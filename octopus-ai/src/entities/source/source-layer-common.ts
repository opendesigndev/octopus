import SourceArtboard from './source-artboard'

import type SourceLayerGroup from './source-layer-group'
import type {
  RawLayer,
  RawResourcesExtGState,
  RawGraphicsState,
  RawGraphicsStateMatrix,
  RawResourcesShadingKeyFunction,
} from '../../typings/raw'
import type SourceLayerXObject from './source-layer-x-object'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'
import type SourceResources from './source-resources'
import type SourceLayerShape from './source-layer-shape'

export type SourceLayerParent = SourceLayerGroup | SourceArtboard | SourceLayerXObject | SourceLayerShape

type SourceLayerCommonOptions = {
  parent: SourceLayerParent
  rawValue: RawLayer
  path: number[]
}
type LayerType = 'TextGroup' | 'MarkedContext' | 'Path' | 'XObject' | 'Shading'

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

  get parentArtboardHeight(): number {
    return this.parentArtboardDimensions.height
  }

  get graphicsState(): Nullable<RawGraphicsState> {
    return 'GraphicsState' in this._rawValue ? this._rawValue.GraphicsState : null
  }

  get extGState(): Nullable<RawResourcesExtGState[string]> {
    const specifiedParameters = this.graphicsState?.SpecifiedParameters || ''
    return this._parent.resources?.ExtGState?.[specifiedParameters]
  }

  get blendMode(): Nullable<RawResourcesExtGState[string]['BM']> {
    return this.extGState?.BM
  }

  get gradientMask(): Nullable<RawResourcesShadingKeyFunction> {
    return this.extGState?.SMask?.G?.Shading?.Sh0?.Function
  }

  get opacity(): Nullable<number> {
    return this.extGState?.CA
  }

  get transformMatrix(): RawGraphicsStateMatrix {
    const rawCtm: RawGraphicsStateMatrix = this.graphicsState?.CTM ?? [1, 0, 0, 1, 0, 0]
    const clonedCtm = [...rawCtm]

    clonedCtm[1] = -rawCtm[1]
    clonedCtm[3] = -rawCtm[3]
    clonedCtm[5] = this.parentArtboardHeight - rawCtm[5]

    return clonedCtm as RawGraphicsStateMatrix
  }
}
