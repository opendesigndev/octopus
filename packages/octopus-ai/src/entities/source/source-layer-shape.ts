import { asArray } from '@opendesign/octopus-common/dist/utils/as.js'

import { initSourceLayerChildren } from '../../utils/layer.js'
import { createSoftMask, initClippingMask } from '../../utils/mask.js'
import { SourceLayerCommon } from './source-layer-common.js'
import { SourceLayerShapeSubPath } from './source-layer-shape-subpath.js'

import type { DashPattern, RawGraphicsState, RawArtboardMediaBox } from '../../typings/raw/index.js'
import type { RawShapeLayer, RawShapeLayerFillRule } from '../../typings/raw/shape-layer.js'
import type { SourceLayerParent } from './source-layer-common.js'
import type { SourceLayerXObjectForm } from './source-layer-x-object-form.js'
import type { Nullish } from '@opendesign/octopus-common/dist/utility-types.js'

type SourceLayerShapeOptions = {
  parent: SourceLayerParent
  rawValue: RawShapeLayer
}

export class SourceLayerShape extends SourceLayerCommon {
  declare _rawValue: RawShapeLayer
  private _subpaths: SourceLayerShapeSubPath[]
  private _clippingPaths: SourceLayerShape[] | null
  private _mask: Nullish<SourceLayerShape>
  private _softMask: Nullish<SourceLayerXObjectForm>

  constructor(options: SourceLayerShapeOptions) {
    super(options)
    this._rawValue = options.rawValue
    this._subpaths = this._initSubpaths()
    this._clippingPaths = this._initClippingPaths()
    this._softMask = this._initSoftMask()
    this._mask = this._initMask()
  }

  private _initSubpaths() {
    return asArray(
      this._rawValue.Subpaths?.map((subPath) => new SourceLayerShapeSubPath({ rawValue: subPath, parent: this }))
    )
  }

  private _initClippingPaths(): SourceLayerShape[] {
    return initSourceLayerChildren({
      parent: this._parent,
      layers: this._clippingPath,
    }) as SourceLayerShape[]
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

  private _initSoftMask(): Nullish<SourceLayerXObjectForm> {
    return createSoftMask({ sMask: this.sMask, parent: this._parent })
  }

  get softMask(): Nullish<SourceLayerXObjectForm> {
    return this._softMask
  }

  private _isRect() {
    return this._subpaths.length > 0 && this._subpaths.every((subpath) => subpath.type === 'Rect')
  }

  get name(): string {
    if (this._rawValue.Name) {
      return this._rawValue.Name
    }

    return this._isRect() ? '<Rectangle>' : '<Path>'
  }

  get subpaths(): SourceLayerShapeSubPath[] {
    return this._subpaths
  }

  setSubpaths(subpaths: SourceLayerShapeSubPath[]): void {
    this._subpaths = subpaths
  }

  get graphicsState(): Nullish<RawGraphicsState> {
    return this._rawValue.GraphicsState
  }

  get mask(): Nullish<SourceLayerShape> {
    return this._mask
  }

  get dashPattern(): Nullish<DashPattern> {
    return this.graphicsState?.DashPattern
  }

  get miterLimit(): Nullish<number> {
    return this.graphicsState?.MiterLimit
  }

  get dashing(): number[] {
    return this.dashPattern?.[0] ?? []
  }

  get dashOffset(): number {
    return this.dashPattern?.[1] ?? 0
  }

  get fillRule(): Nullish<RawShapeLayerFillRule> {
    return this._rawValue.FillRule
  }

  get lineJoin(): number {
    return this.graphicsState?.LineJoin || 0
  }

  get lineCap(): number {
    return this.graphicsState?.LineCap || 0
  }

  get colorStroking(): Nullish<number[]> {
    return this.graphicsState?.ColorStroking
  }

  get colorSpaceNonStroking(): Nullish<string> {
    return this.graphicsState?.ColorSpaceNonStroking
  }

  get colorSpaceStroking(): Nullish<string> {
    return this.graphicsState?.ColorSpaceStroking
  }

  get colorNonStroking(): Nullish<number[]> {
    return this.graphicsState?.ColorNonStroking
  }

  get lineWidth(): number {
    return this.graphicsState?.LineWidth || 0
  }

  get parentArtboardHeight(): number {
    return this.parentArtboard?.dimensions?.height || 0
  }

  get hasFill(): boolean {
    return Boolean(this._rawValue.Fill)
  }

  get stroke(): Nullish<boolean> {
    return this._rawValue.Stroke
  }

  private get _clippingPath(): Nullish<RawGraphicsState['ClippingPath']> {
    return this.graphicsState?.ClippingPath
  }

  get clippingPaths(): SourceLayerShape[] | null {
    return this._clippingPaths
  }

  get parentArtboardMediaBox(): RawArtboardMediaBox {
    return this.parentArtboard?.mediaBox || [0, 0, 0, 0]
  }
}
