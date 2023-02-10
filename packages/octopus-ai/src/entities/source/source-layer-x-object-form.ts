import { initSourceLayerChildren } from '../../utils/layer'
import { createSoftMask, initClippingMask } from '../../utils/mask'
import { SourceLayerCommon } from './source-layer-common'
import { SourceResources } from './source-resources'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { RawGraphicsState, RawResourcesExtGState, RawResourcesXObject } from '../../typings/raw'
import type { RawXObjectLayer } from '../../typings/raw/x-object'
import type { SourceLayerParent, XObjectSubtype } from './source-layer-common'
import type { SourceLayerShape } from './source-layer-shape'
import type { Nullish } from '@opendesign/octopus-common/utility-types'

export type SourceLayerXObjectFormOptions = {
  rawValue: RawResourcesXObject
  parent: SourceLayerParent
  xObject?: RawXObjectLayer
}

export class SourceLayerXObjectForm extends SourceLayerCommon {
  static DEFAULT_NAME = '<XObjectForm>'

  protected _rawValue: RawResourcesXObject
  private _resources: Nullish<SourceResources>
  private _children: SourceLayer[]
  private _xObject: Nullish<RawXObjectLayer>
  private _softMask: Nullish<SourceLayerXObjectForm>
  private _mask: Nullish<SourceLayerShape>
  private _clippingPaths: SourceLayerShape[] | null

  constructor(options: SourceLayerXObjectFormOptions) {
    super(options)
    this._rawValue = options.rawValue
    this._parent = options.parent
    this._xObject = options.xObject
    this._resources = this._initResources()
    this._children = this._initChildren()
    this._clippingPaths = this._initClippingPaths()
    this._softMask = this._initSoftMask()
    this._mask = this._initMask()
  }

  private _initChildren(): SourceLayer[] {
    if (this.subtype === 'Form') {
      const data = this._rawValue?.Data
      return initSourceLayerChildren({
        layers: Array.isArray(data) ? data : [],
        parent: this,
      }) as SourceLayer[]
    }

    return []
  }

  private _initSoftMask(): Nullish<SourceLayerXObjectForm> {
    return createSoftMask({ sMask: this.sMask, parent: this._parent })
  }

  private _initClippingPaths(): SourceLayerShape[] {
    return initSourceLayerChildren({
      parent: this,
      layers: this._clippingPath ?? [],
    }) as SourceLayerShape[]
  }

  private _initMask(): Nullish<SourceLayerShape> {
    if (this._softMask) {
      return null
    }

    const mask = initClippingMask(this)

    if (!mask) {
      return null
    }

    return mask
  }

  get softMask(): Nullish<SourceLayerXObjectForm> {
    return this._softMask
  }

  get mask(): Nullish<SourceLayerShape> {
    return this._mask
  }

  private _initResources(): Nullish<SourceResources> {
    const rawResources = this._rawValue.Resources
    return rawResources ? new SourceResources({ rawValue: rawResources }) : undefined
  }

  get resources(): Nullish<SourceResources> {
    return this._resources
  }

  get subtype(): Nullish<XObjectSubtype> {
    return this._rawValue.Subtype
  }

  get type(): Nullish<XObjectSubtype> {
    return this.subtype
  }

  get children(): SourceLayer[] {
    return this._children
  }

  get name(): typeof SourceLayerXObjectForm.DEFAULT_NAME {
    return SourceLayerXObjectForm.DEFAULT_NAME
  }

  private get _clippingPath(): Nullish<RawGraphicsState['ClippingPath']> {
    return this.graphicsState?.ClippingPath
  }

  get graphicsState(): Nullish<RawGraphicsState> {
    const xObject = this._xObject
    return xObject ? xObject.GraphicsState : null
  }

  get externalGraphicState(): Nullish<RawResourcesExtGState[string]> {
    const specifiedParameters = this.graphicsState?.SpecifiedParameters || ''
    return this._parent.resources?.externalGraphicState?.[specifiedParameters]
  }

  get clippingPaths(): SourceLayerShape[] | null {
    return this._clippingPaths
  }
}
