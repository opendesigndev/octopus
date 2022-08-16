import { createSourceLayer } from '../../factories/create-source-layer'
import { initChildLayers } from '../../utils/layer'
import { createSoftMask, initClippingMask } from '../../utils/mask'
import { SourceArtboard } from './source-artboard'
import { SourceLayerCommon } from './source-layer-common'
import { SourceResources } from './source-resources'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { RawGraphicsState, RawResourcesExtGState, RawResourcesXObject } from '../../typings/raw'
import type { RawXObjectLayer } from '../../typings/raw/x-object'
import type { SourceLayerParent, XObjectSubtype } from './source-layer-common'
import type { SourceLayerGroup } from './source-layer-group'
import type { SourceLayerShape } from './source-layer-shape'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

export type SourceLayerXObjectFormOptions = {
  rawValue: RawResourcesXObject
  parent: SourceLayerParent
  xObject?: RawXObjectLayer
}

export class SourceLayerXObjectForm extends SourceLayerCommon {
  static DEFAULT_NAME = '<XObjectForm>'

  protected _rawValue: RawResourcesXObject
  private _resources: Nullable<SourceResources>
  private _children: SourceLayer[]
  private _xObject: Nullable<RawXObjectLayer>
  private _softMask: Nullable<SourceLayerXObjectForm>
  private _mask: Nullable<SourceLayerShape>
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
      return initChildLayers({
        layers: Array.isArray(data) ? data : [],
        parent: this,
        builder: createSourceLayer,
      }) as SourceLayer[]
    }

    return []
  }

  private _initSoftMask(): Nullable<SourceLayerXObjectForm> {
    return createSoftMask({ sMask: this.sMask, parent: this._parent })
  }

  private _initClippingPaths(): SourceLayerShape[] {
    return initChildLayers({
      parent: this,
      layers: this._clippingPath,
      builder: createSourceLayer,
    }) as SourceLayerShape[]
  }

  private _initMask(): Nullable<SourceLayerShape> {
    const mask = initClippingMask(this)

    if (!mask) {
      return null
    }

    return mask
  }

  get softMask(): Nullable<SourceLayerXObjectForm> {
    return this._softMask
  }

  get mask(): Nullable<SourceLayerShape> {
    return this._mask
  }

  get parentArtboard(): SourceArtboard | null {
    if (!this._parent) return null

    const parent = this._parent as SourceLayerGroup | SourceArtboard
    return parent instanceof SourceArtboard ? parent : parent.parentArtboard
  }

  private _initResources(): Nullable<SourceResources> {
    const rawResources = this._rawValue.Resources
    return rawResources ? new SourceResources({ rawValue: rawResources }) : undefined
  }

  get resources(): Nullable<SourceResources> {
    return this._resources
  }

  get subtype(): Nullable<XObjectSubtype> {
    return this._rawValue.Subtype
  }

  get type(): Nullable<XObjectSubtype> {
    return this.subtype
  }

  get children(): SourceLayer[] {
    return this._children
  }

  get name(): typeof SourceLayerXObjectForm.DEFAULT_NAME {
    return SourceLayerXObjectForm.DEFAULT_NAME
  }

  private get _clippingPath(): Nullable<RawGraphicsState['ClippingPath']> {
    return this.graphicsState?.ClippingPath
  }

  get graphicsState(): Nullable<RawGraphicsState> {
    const xObject = this._xObject
    return xObject ? xObject.GraphicsState : null
  }

  get extGState(): Nullable<RawResourcesExtGState[string]> {
    const specifiedParameters = this.graphicsState?.SpecifiedParameters || ''
    return this._parent.resources?.ExtGState?.[specifiedParameters]
  }

  get clippingPaths(): SourceLayerShape[] | null {
    return this._clippingPaths
  }
}
