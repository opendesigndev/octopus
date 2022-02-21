import SourceLayerCommon from '../entities-source/source-layer-common'

import type { SourceLayerParent } from '../entities-source/source-layer-common'
import type { RawGraphicsState } from '../typings/source/graphics-state'
import type { Nullable } from '../typings/helpers'
import type { RawXObjectLayer } from '../typings/source/x-object'

type SourceLayerXObjectOptions = {
  parent: SourceLayerParent
  rawValue: RawXObjectLayer
  path: number[]
}

export default class SourceLayerShape extends SourceLayerCommon {
  public _rawValue: RawXObjectLayer

  constructor(options: SourceLayerXObjectOptions) {
    super(options)
    this._rawValue = options.rawValue
  }

  get name(): Nullable<string> {
    return this._rawValue.Name
  }

  get graphicsState(): Nullable<RawGraphicsState> {
    return this._rawValue.GraphicsState
  }

  get lineJoin(): number {
    return this.graphicsState?.LineJoin || 0
  }

  // get lineCap(): number {
  //   return this.graphicsState?.LineCap || 0
  // }

  // get XObject () {
  //     this._parent.resources.
  // }

  //  const xobject = _.get(artboardData.resources, `XObject.${name}`)
  //     const subtype = _.get(xobject, 'Subtype')
}
