import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

import type { RawXObjectLayer } from '../../typings/raw/x-object'
import type { SourceLayerParent } from './source-layer-common'
import SourceLayerCommon from './source-layer-common'

type SourceLayerXObjectOptions = {
  parent: SourceLayerParent
  rawValue: RawXObjectLayer
  path: number[]
}

export default class SourceLayerXObjectImage extends SourceLayerCommon {
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
