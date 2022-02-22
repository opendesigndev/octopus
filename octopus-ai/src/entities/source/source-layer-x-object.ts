import SourceLayerCommon from '../source/source-layer-common'

import type { SourceLayerParent } from '../source/source-layer-common'
import type { RawGraphicsState } from '../../typings/raw/graphics-state'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'
import type { RawXObjectLayer } from '../../typings/raw/x-object'

type SourceLayerXObjectOptions = {
  parent: SourceLayerParent
  rawValue: RawXObjectLayer
  path: number[]
}

export default class SourceLayerXObject extends SourceLayerCommon {
  protected _rawValue: RawXObjectLayer

  constructor(options: SourceLayerXObjectOptions) {
    super(options)
    this._rawValue = options.rawValue
  }

  get name(): Nullable<string> {
    return this._rawValue.Name
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
