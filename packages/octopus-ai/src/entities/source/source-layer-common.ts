import { SourceArtboard } from './source-artboard.js'
import { SourceLayerXObjectForm } from './source-layer-x-object-form.js'

import type { SourceLayerGroup } from './source-layer-group.js'
import type { SourceLayerShape } from './source-layer-shape.js'
import type { SourceResources } from './source-resources.js'
import type {
  RawLayer,
  RawResourcesExtGState,
  RawGraphicsState,
  RawGraphicsStateMatrix,
  RawResourcesShadingKeyFunction,
  RawResourcesExtGStateSmask,
} from '../../typings/raw/index.js'
import type { Nullish } from '@opendesign/octopus-common/dist/utility-types.js'

export type SourceLayerParent = SourceLayerGroup | SourceArtboard | SourceLayerXObjectForm | SourceLayerShape

type SourceLayerCommonOptions = {
  parent: SourceLayerParent
  rawValue: RawLayer
}
export type LayerType = 'TextGroup' | 'MarkedContext' | 'Path' | 'XObject' | 'Shading' | XObjectSubtype
export type XObjectSubtype = 'Form' | 'Image'

export class SourceLayerCommon {
  protected _parent: SourceLayerParent
  protected _rawValue: RawLayer
  protected _id: string

  constructor(options: SourceLayerCommonOptions) {
    this._rawValue = options.rawValue
    this._parent = options.parent
    this._id = this.parentArtboard.uniqueId()
  }

  get id(): string {
    return this._id
  }

  get type(): Nullish<LayerType> {
    return this._rawValue.Type
  }

  get raw(): RawLayer {
    return this._rawValue
  }

  get parentArtboard(): SourceArtboard {
    const parent = this._parent as SourceLayerGroup | SourceArtboard
    return parent instanceof SourceArtboard ? parent : parent.parentArtboard
  }

  get resourcesTarget(): Nullish<SourceArtboard | SourceLayerXObjectForm> {
    if (this._parent instanceof SourceArtboard || this._parent instanceof SourceLayerXObjectForm) {
      return this._parent
    }

    return this._parent.resourcesTarget
  }

  get resources(): Nullish<SourceResources> {
    return this.resourcesTarget?.resources
  }

  get parentArtboardDimensions(): { width: number; height: number } {
    return this.parentArtboard?.dimensions || { width: 0, height: 0 }
  }

  get parentArtboardHeight(): number {
    return this.parentArtboardDimensions.height
  }

  get graphicsState(): Nullish<RawGraphicsState> {
    return 'GraphicsState' in this._rawValue ? this._rawValue.GraphicsState : null
  }

  get externalGraphicState(): Nullish<RawResourcesExtGState[string]> {
    const specifiedParameters = this.graphicsState?.SpecifiedParameters || ''
    return this.resources?.externalGraphicState?.[specifiedParameters]
  }

  get blendMode(): Nullish<RawResourcesExtGState[string]['BM']> {
    return this.externalGraphicState?.BM
  }

  get gradientMask(): Nullish<RawResourcesShadingKeyFunction> {
    const g = this.sMask?.G

    if (!g || !('Shading' in g)) {
      return null
    }

    return g.Shading?.Sh0?.Function
  }

  get sMask(): Nullish<RawResourcesExtGStateSmask> {
    return this.externalGraphicState?.SMask
  }

  get opacity(): Nullish<number> {
    return this.externalGraphicState?.CA
  }

  get transformMatrix(): RawGraphicsStateMatrix {
    const rawCtm: RawGraphicsStateMatrix = this.graphicsState?.CTM ?? [1, 0, 0, 1, 0, 0]
    const clonedCtm = [...rawCtm]

    clonedCtm[1] = -rawCtm[1]
    clonedCtm[3] = -rawCtm[3]
    clonedCtm[5] = this.parentArtboardHeight - rawCtm[5]

    return clonedCtm as RawGraphicsStateMatrix
  }

  get hiddenContentIds(): number[] {
    return this.parentArtboard?.hiddenContentIds || []
  }
}
