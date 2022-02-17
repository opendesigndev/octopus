import SourceArtboard from './source-artboard'
import SourceLayerGroup from './source-layer-group'
import type { RawLayer } from '../typings/source'
import SourceLayerXObject from './source-layer-x-object'
import { Nullable } from '../typings/helpers'
import { Octopus } from '../typings/octopus'
import SourceResources from './source-resources'

export type SourceLayerParent = SourceLayerGroup | SourceArtboard | SourceLayerXObject

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

  get parentArtboardDimensions(): Octopus['Dimensions'] {
    return this.parentArtboard?.dimensions || { width: 0, height: 0 }
  }
}
