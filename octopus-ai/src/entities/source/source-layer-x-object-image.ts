import path from 'path/posix'

import { initSourceLayerChildren } from '../../utils/layer'
import { createSoftMask, initClippingMask } from '../../utils/mask'
import { SourceLayerCommon } from './source-layer-common'

import type { RawGraphicsState, RawResourcesExtGState, RawResourcesXObject, XObjectSubtype } from '../../typings/raw'
import type { RawXObjectLayer } from '../../typings/raw/x-object'
import type { SourceLayerParent } from './source-layer-common'
import type { SourceLayerShape } from './source-layer-shape'
import type { SourceLayerXObjectForm } from './source-layer-x-object-form'
import type { SourceResources } from './source-resources'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

type SourceLayerXObjectImageOptions = {
  parent: SourceLayerParent
  rawValue: RawXObjectLayer
  xObject: RawXObjectLayer
}

export class SourceLayerXObjectImage extends SourceLayerCommon {
  protected _rawValue: RawResourcesXObject
  private _xObject: Nullable<RawXObjectLayer>
  private _softMask: Nullable<SourceLayerXObjectForm>
  private _mask: Nullable<SourceLayerShape>
  private _clippingPaths: SourceLayerShape[] | null

  constructor(options: SourceLayerXObjectImageOptions) {
    super(options)
    this._rawValue = options.rawValue
    this._parent = options.parent
    this._xObject = options.xObject
    this._clippingPaths = this._initClippingPaths()
    this._softMask = this._initSoftMask()
    this._mask = this._initMask()
  }

  get name(): Nullable<string> {
    return this._rawValue.Name
  }

  get parentResources(): Nullable<SourceResources> {
    return this._parent.resources
  }

  get graphicsState(): Nullable<RawGraphicsState> {
    const xObject = this._xObject
    return xObject ? xObject.GraphicsState : null
  }

  get extGState(): Nullable<RawResourcesExtGState[string]> {
    const specifiedParameters = this.graphicsState?.SpecifiedParameters || ''
    return this._parent.resources?.ExtGState?.[specifiedParameters]
  }

  private _initClippingPaths(): SourceLayerShape[] {
    return initSourceLayerChildren({
      parent: this._parent,
      layers: this._clippingPath ?? [],
    }) as SourceLayerShape[]
  }

  private _initSoftMask(): Nullable<SourceLayerXObjectForm> {
    return createSoftMask({ sMask: this.sMask, parent: this._parent })
  }

  private _initMask(): Nullable<SourceLayerShape> {
    const mask = initClippingMask(this)

    if (!mask) {
      return null
    }

    return mask
  }

  get fileName(): Nullable<string> {
    const { subtype } = this

    if (!subtype) {
      return null
    }

    if (this._rawValue.Subtype !== 'Image') {
      return null
    }

    const data = this._rawValue?.Data as Record<string, string>

    if (!data) {
      return null
    }

    if (!(subtype in data)) {
      return null
    }

    const name = data[subtype]

    if (!name) {
      return null
    }

    return path.basename(name)
  }

  private get _clippingPath(): Nullable<RawGraphicsState['ClippingPath']> {
    return this.graphicsState?.ClippingPath
  }

  get softMask(): Nullable<SourceLayerXObjectForm> {
    return this._softMask
  }

  get mask(): Nullable<SourceLayerShape> {
    return this._mask
  }

  get clippingPaths(): SourceLayerShape[] | null {
    return this._clippingPaths
  }

  get subtype(): Nullable<XObjectSubtype> {
    return this._rawValue.Subtype
  }

  get type(): Nullable<XObjectSubtype> {
    return this.subtype
  }
}
