import SourceLayerCommon from './source-layer-common'
import { SourceLayerParent } from './source-layer-common'
import { RawShapeLayer, RawShapeLayerFillRule } from '../typings/source/shape-layer'
import SourceLayerShapeSubPath from './source-layer-shape-subpath'
import { DashPattern, RawGraphicsState, RawGraphicsStateMatrix } from '../typings/source/graphics-state'
import { Nullable } from '../typings/helpers'
import { RawLayer, RawResourcesExtGState } from '../typings/source'
import { createSourceLayerShape, SourceLayer } from '../factories/create-source-layer'
import { asArray } from '@avocode/octopus-common/dist/utils/as'

type SourceLayerShapeOptions = {
  parent: SourceLayerParent
  rawValue: RawShapeLayer
  path: number[]
}

export default class SourceLayerShape extends SourceLayerCommon {
  public _rawValue: RawShapeLayer
  private _subpaths: SourceLayerShapeSubPath[]
  private _sourceMask: SourceLayerShape[] | null

  constructor(options: SourceLayerShapeOptions) {
    super(options)
    this._rawValue = options.rawValue
    this._subpaths = this._initSubpaths()
    this._sourceMask = this._initSourceMask()
  }

  private _initSubpaths() {
    const path = this.path
    return (
      this._rawValue.Subpaths?.map(
        (subPath) => new SourceLayerShapeSubPath({ path, rawValue: subPath, parent: this })
      ) || []
    )
  }

  private _initSourceMask() {
    if (!this.clippingPath || !this.clippingPath.length) {
      return null
    }

    const children = asArray(this.clippingPath)
    return children.reduce((children: SourceLayerShape[], layer: RawLayer, i: number) => {
      const sourceLayer = createSourceLayerShape({
        layer,
        parent: this as SourceLayerParent,
        path: this.path.concat(i),
      })

      return sourceLayer ? [...children, sourceLayer] : children
    }, [])
  }

  private _isRect() {
    return this._subpaths.length > 0 && this._subpaths.every((subpath) => subpath.type === 'Rect')
  }

  get name(): string {
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

  get getExtGState(): Nullable<RawResourcesExtGState[string]> {
    const specifiedParameters = this.graphicsState?.SpecifiedParameters || ''
    return this._parent.resources?.ExtGState?.[specifiedParameters]
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

  //   get lineCap(): number {
  //     return this.graphicsState?.LineCap || 0
  //   }

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

  get transformMatrix(): RawGraphicsStateMatrix {
    const rawCtm: RawGraphicsStateMatrix = this._rawValue?.GraphicsState?.CTM
      ? [...this._rawValue?.GraphicsState?.CTM]
      : [1, 0, 0, 1, 0, 0]

    rawCtm[5] = -rawCtm[5]
    return rawCtm
  }

  get fill(): boolean {
    return Boolean(this._rawValue.Fill)
  }

  get stroke(): boolean {
    return Boolean(this._rawValue.Stroke)
  }

  get clippingPath(): Nullable<RawGraphicsState['ClippingPath']> {
    return this.graphicsState?.ClippingPath
  }

  get sourceMask() {
    return this._sourceMask
  }
}
