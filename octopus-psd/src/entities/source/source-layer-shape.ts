import type {
  RawLayerEffect,
  RawLayerShape,
  RawShapeFill,
  RawShapeMask,
  RawShapeStrokeStyle,
} from '../../typings/source'
import { SourceLayerCommon } from './source-layer-common'
import type { SourceLayerParent } from './source-layer-common'
import { getBoundsFor, getColorFor } from './utils'
import { mapPath, mapPathComponents } from './shape'
import type { SourcePathComponent, SourcePath } from './shape'

type SourceLayerShapeOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerShape
}

export class SourceLayerShape extends SourceLayerCommon {
  protected _rawValue: RawLayerShape
  protected _parent: SourceLayerParent

  constructor(options: SourceLayerShapeOptions) {
    super()
    this._parent = options.parent
    this._rawValue = options.rawValue
  }

  get alignEdges() {
    return this._rawValue.alignEdges
  }

  get fill() {
    const fill = this._rawValue.fill
    return {
      ...fill,
      color: getColorFor(fill?.color),
    } as RawShapeFill
  }

  get layerEffects() {
    const layerEffects = this._rawValue.layerEffects
    return {
      ...layerEffects,
    } as RawLayerEffect
  }

  get mask() {
    const mask = this._rawValue.mask
    return {
      ...mask,
    } as RawShapeMask
  }

  get pathBounds() {
    return this.path.bounds
  }

  get firstPathComponent(): SourcePathComponent | undefined {
    return this.pathComponents[0]
  }

  get pathComponents(): SourcePathComponent[] {
    return this.path.pathComponents
  }

  get path(): SourcePath {
    return mapPath(this._rawValue.path)
  }

  get strokeStyle() {
    const strokeStyle = this._rawValue.strokeStyle
    return {
      ...strokeStyle,
    } as RawShapeStrokeStyle
  }
}
