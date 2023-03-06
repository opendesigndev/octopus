import { SourceLayerCommon } from './source-layer-common.js'
import { pathBasename } from '../../utils/fs-path.js'
import { initSourceLayerChildren } from '../../utils/layer.js'
import { createSoftMask, initClippingMask } from '../../utils/mask.js'

import type { SourceLayerParent } from './source-layer-common.js'
import type { SourceLayerShape } from './source-layer-shape.js'
import type { SourceLayerXObjectForm } from './source-layer-x-object-form.js'
import type {
  RawGraphicsState,
  RawResourcesExtGState,
  RawResourcesXObject,
  RawResourcesXObjectImage,
  XObjectSubtype,
} from '../../typings/raw/index.js'
import type { RawXObjectLayer } from '../../typings/raw/x-object.js'
import type { Nullish } from '@opendesign/octopus-common/dist/utility-types.js'

type SourceLayerXObjectImageOptions = {
  parent: SourceLayerParent
  rawValue: RawXObjectLayer
  xObject: RawXObjectLayer
}

export class SourceLayerXObjectImage extends SourceLayerCommon {
  declare _rawValue: RawResourcesXObject
  private _xObject: Nullish<RawXObjectLayer>
  private _softMask: Nullish<SourceLayerXObjectForm>
  private _mask: Nullish<SourceLayerShape>
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

  get name(): Nullish<string> {
    return this._rawValue.Name
  }

  get graphicsState(): Nullish<RawGraphicsState> {
    const xObject = this._xObject
    return xObject ? xObject.GraphicsState : null
  }

  get externalGraphicState(): Nullish<RawResourcesExtGState[string]> {
    const specifiedParameters = this.graphicsState?.SpecifiedParameters || ''
    return this._parent.resources?.externalGraphicState?.[specifiedParameters]
  }

  private _initClippingPaths(): SourceLayerShape[] {
    return initSourceLayerChildren({
      parent: this._parent,
      layers: this._clippingPath ?? [],
    }) as SourceLayerShape[]
  }

  private _initSoftMask(): Nullish<SourceLayerXObjectForm> {
    return createSoftMask({ sMask: this.sMask, parent: this._parent })
  }

  private _initMask(): Nullish<SourceLayerShape> {
    if (this.softMask) {
      return null
    }

    const mask = initClippingMask(this)

    if (!mask) {
      return null
    }

    return mask
  }

  get fileName(): Nullish<string> {
    const { subtype } = this
    if (!subtype || subtype !== 'Image') return null
    const data = this._rawValue?.Data as RawResourcesXObjectImage
    return data?.[subtype] ? pathBasename(data[subtype]) : null
  }

  private get _clippingPath(): Nullish<RawGraphicsState['ClippingPath']> {
    return this.graphicsState?.ClippingPath
  }

  get softMask(): Nullish<SourceLayerXObjectForm> {
    return this._softMask
  }

  get mask(): Nullish<SourceLayerShape> {
    return this._mask
  }

  get clippingPaths(): SourceLayerShape[] | null {
    return this._clippingPaths
  }

  get subtype(): Nullish<XObjectSubtype> {
    return this._rawValue.Subtype
  }

  get type(): Nullish<XObjectSubtype> {
    return this.subtype
  }
}
