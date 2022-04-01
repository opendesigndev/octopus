import { asArray } from '@avocode/octopus-common/dist/utils/as'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

import { createSourceLayerShape } from '../../factories/create-source-layer'
import type { DashPattern, RawArtboardMediaBox, RawGraphicsState } from '../../typings/raw'
import type { RawShapeLayer, RawShapeLayerFillRule } from '../../typings/raw/shape-layer'
import type { SourceLayerParent } from './source-layer-common'
import SourceLayerCommon from './source-layer-common'
import SourceLayerShapeSubPath from './source-layer-shape-subpath'

type SourceLayerShapeOptions = {
  parent: SourceLayerParent
  rawValue: RawShapeLayer
  path: number[]
}

export default class SourceLayerShape extends SourceLayerCommon {
  protected _rawValue: RawShapeLayer
  private _subpaths: SourceLayerShapeSubPath[]
  private _clippingPaths: SourceLayerShape[] | null

  constructor(options: SourceLayerShapeOptions) {
    super(options)
    this._rawValue = options.rawValue
    this._subpaths = this._initSubpaths()
    this._clippingPaths = this._initClippingPaths()
  }

  private _initSubpaths() {
    const path = this.path

    return asArray(
      this._rawValue.Subpaths?.map((subPath) => new SourceLayerShapeSubPath({ path, rawValue: subPath, parent: this }))
    )
  }

  private _initClippingPaths(): SourceLayerShape[] {
    const children = asArray(this._clippingPath)
    return children
      .map((layer: RawShapeLayer, i: number) =>
        createSourceLayerShape({
          layer,
          parent: this,
          path: [...this.path, i],
        })
      )
      .filter((sourceLayer) => !!sourceLayer) as SourceLayerShape[]
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

  get graphicsState(): Nullable<RawGraphicsState> {
    return this._rawValue.GraphicsState
  }

  get dashPattern(): Nullable<DashPattern> {
    return this.graphicsState?.DashPattern
  }

  get dashing(): number[] {
    return this.dashPattern?.[0] ?? []
  }

  get fillRule(): Nullable<RawShapeLayerFillRule> {
    return this._rawValue.FillRule
  }

  //   get isStroke(): boolean {
  //     return Boolean(this._rawValue.Stroke)
  //   }

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
