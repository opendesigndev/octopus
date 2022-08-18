import { asArray } from '@avocode/octopus-common/dist/utils/as'

import { initSourceLayerChildren } from '../../utils/layer'
import { createSoftMask, initClippingMask } from '../../utils/mask'
import { SourceLayerCommon } from './source-layer-common'
import { SourceLayerShapeSubPath } from './source-layer-shape-subpath'

import type { DashPattern, RawGraphicsState, RawArtboardMediaBox } from '../../typings/raw'
import type { RawShapeLayer, RawShapeLayerFillRule } from '../../typings/raw/shape-layer'
import type { SourceLayerParent } from './source-layer-common'
import type { SourceLayerXObjectForm } from './source-layer-x-object-form'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

type SourceLayerShapeOptions = {
  parent: SourceLayerParent
  rawValue: RawShapeLayer
}

export class SourceLayerShape extends SourceLayerCommon {
  protected _rawValue: RawShapeLayer
  private _subpaths: SourceLayerShapeSubPath[]
  private _clippingPaths: SourceLayerShape[] | null
  private _mask: Nullable<SourceLayerShape>
  private _softMask: Nullable<SourceLayerXObjectForm>

  constructor(options: SourceLayerShapeOptions) {
    super(options)
    this._rawValue = options.rawValue
    this._subpaths = this._initSubpaths()
    this._clippingPaths = this._initClippingPaths()
    this._mask = this._initMask()
    this._softMask = this._initSoftMask()
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

  private _initMask(): Nullable<SourceLayerShape> {
    const mask = initClippingMask(this)

    if (!mask) {
      return null
    }

    return mask
  }

  private _initSoftMask(): Nullable<SourceLayerXObjectForm> {
    return createSoftMask({ sMask: this.sMask, parent: this._parent })
  }

  get softMask(): Nullable<SourceLayerXObjectForm> {
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

  get graphicsState(): Nullable<RawGraphicsState> {
    return this._rawValue.GraphicsState
  }

  get mask(): Nullable<SourceLayerShape> {
    return this._mask
  }

  get dashPattern(): Nullable<DashPattern> {
    return this.graphicsState?.DashPattern
  }

  get dashing(): number[] {
    return this.dashPattern?.[0] ?? []
  }

  get dashOffset(): number {
    return this.dashPattern?.[1] ?? 0
  }

  get fillRule(): Nullable<RawShapeLayerFillRule> {
    return this._rawValue.FillRule
  }

  get lineJoin(): number {
    return this.graphicsState?.LineJoin || 0
  }

  get lineCap(): number {
    return this.graphicsState?.LineCap || 0
  }

  get colorStroking(): Nullable<number[]> {
    return this.graphicsState?.ColorStroking
  }

  get colorSpaceNonStroking(): Nullable<string> {
    return this.graphicsState?.ColorSpaceNonStroking
  }

  get colorSpaceStroking(): Nullable<string> {
    return this.graphicsState?.ColorSpaceStroking
  }

  get colorNonStroking(): Nullable<number[]> {
    return this.graphicsState?.ColorNonStroking
  }

  get lineWidth(): number {
    return this.graphicsState?.LineWidth || 0
  }

  get parentArtboardHeight(): number {
    return this.parentArtboard?.dimensions?.height || 0
  }

  get isFill(): boolean {
    return Boolean(this._rawValue.Fill)
  }

  get stroke(): Nullable<boolean> {
    return this._rawValue.Stroke
  }

  private get _clippingPath(): Nullable<RawGraphicsState['ClippingPath']> {
    return this.graphicsState?.ClippingPath
  }

  get clippingPaths(): SourceLayerShape[] | null {
    return this._clippingPaths
  }

  get parentArtboardMediaBox(): RawArtboardMediaBox {
    return this.parentArtboard?.mediaBox || [0, 0, 0, 0]
  }
}
