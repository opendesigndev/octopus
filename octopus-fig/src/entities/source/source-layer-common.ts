import { getTransformFor } from '../../utils/source'
import { SourceArtboard } from './source-artboard'
import { SourceEntity } from './source-entity'

import type { RawBlendMode, RawLayer } from '../../typings/raw'
import type { SourceTransform } from '../../typings/source'
import type { SourceLayerFrame } from './source-layer-frame'

export type SourceLayerParent = SourceArtboard | SourceLayerFrame

type SourceLayerOptions = {
  parent: SourceLayerParent
  rawValue: RawLayer
}

export class SourceLayerCommon extends SourceEntity {
  protected _rawValue: RawLayer
  protected _parent: SourceLayerParent

  constructor(options: SourceLayerOptions) {
    super(options.rawValue)
    this._parent = options.parent
  }

  get id(): string | undefined {
    return this._rawValue.id
  }

  get name(): string | undefined {
    return this._rawValue.name
  }

  get parent(): SourceLayerParent {
    return this._parent
  }

  get parentArtboard(): SourceArtboard {
    const parent = this._parent
    return parent instanceof SourceArtboard ? parent : parent.parentArtboard
  }

  // get artboardColor(): SourceColor | null {
  //   switch (this._rawValue.artboard?.artboardBackgroundType) {
  //     case 1: // white
  //       return getColorFor({ blue: 255, green: 255, red: 255 })
  //     case 2: // black
  //       return getColorFor({ blue: 0, green: 0, red: 0 })
  //     case 3: // transparent
  //       return null
  //     case 4: // other
  //       return getColorFor(this._rawValue.artboard?.color)
  //   }
  //   return null
  // }

  // get isArtboard(): boolean {
  //   return this._rawValue.artboard !== undefined
  // }

  get visible(): boolean {
    return this._rawValue.visible ?? true
  }

  // get bounds(): SourceBounds {
  //   return this.isArtboard ? getBoundsFor(this._rawValue.artboard?.artboardRect) : getBoundsFor(this._rawValue.bounds)
  // }

  // get opacity(): number {
  //   return getUnitRatioFor(this._rawValue.blendOptions?.opacity?.value)
  // }

  get blendMode(): RawBlendMode | undefined {
    return this._rawValue.blendMode
  }

  get transform(): SourceTransform | null {
    return getTransformFor(this._rawValue.relativeTransform)
  }

  // @firstCallMemo()
  // get layerEffects(): SourceLayerEffects {
  //   return new SourceLayerEffects(this._rawValue.layerEffects)
  // }

  // @firstCallMemo()
  // get path(): SourcePath | undefined {
  //   if (this._rawValue.path) return new SourcePath(this._rawValue.path)
  // }
}
