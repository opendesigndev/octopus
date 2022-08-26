import { initSourceLayerChildren } from '../../utils/layer'
import { createSoftMask } from '../../utils/mask'
import { SourceArtboard } from './source-artboard'
import { SourceLayerCommon } from './source-layer-common'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { RawGroupLayer } from '../../typings/raw'
import type { SourceLayerParent } from './source-layer-common'
import type { SourceLayerXObjectForm } from './source-layer-x-object-form'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

type SourceLayerGroupOptions = {
  parent: SourceLayerParent
  rawValue: RawGroupLayer
}

export class SourceLayerGroup extends SourceLayerCommon {
  protected _rawValue: RawGroupLayer
  private _children: SourceLayer[]
  private _softMask: Nullable<SourceLayerXObjectForm>

  static DEFAULT_NAME = '<Group>'

  constructor(options: SourceLayerGroupOptions) {
    super(options)
    this._rawValue = options.rawValue
    this._children = this._initChildren()
    this._softMask = this._initSoftMask()
  }

  private _initChildren() {
    return initSourceLayerChildren({
      parent: this,
      layers: this._rawValue.Kids,
    })
  }

  get children(): SourceLayer[] {
    return this._children
  }

  get name(): string {
    const propertiesId = this._rawValue.Properties

    if (!(this._parent instanceof SourceArtboard) || !propertiesId) {
      return SourceLayerGroup.DEFAULT_NAME
    }

    const name = this._parent.resources.getPropertiesById(propertiesId)?.Name

    return name ?? SourceLayerGroup.DEFAULT_NAME
  }

  private _initSoftMask(): Nullable<SourceLayerXObjectForm> {
    return createSoftMask({ sMask: this.sMask, parent: this._parent })
  }

  get softMask(): Nullable<SourceLayerXObjectForm> {
    return this._softMask
  }
}
