import type { SourceArtboard } from './source-artboard.js'
import type { SourceLayerGroup } from './source-layer-group.js'
import type { SourceLayerShape } from './source-layer-shape.js'
import type { Defined } from '../../typings/helpers.js'
import type { RawLayer } from '../../typings/source/index.js'

/** Just a helper types */
type DefinedStyle = Defined<RawLayer['style']>
type DefinedUx = Defined<Defined<RawLayer['meta']>['ux']>

export type SourceLayerParent = SourceArtboard | SourceLayerGroup | SourceLayerShape

export class SourceLayerCommon {
  protected _parent: SourceLayerParent
  protected _rawValue: RawLayer

  get transform(): RawLayer['transform'] {
    return this._rawValue.transform
  }

  get type(): RawLayer['type'] {
    return this._rawValue.type
  }

  get id(): RawLayer['id'] {
    return this._rawValue.id
  }

  get name(): RawLayer['name'] {
    return this._rawValue.name
  }

  get visible(): RawLayer['visible'] {
    return this._rawValue.visible
  }

  get blendMode(): DefinedStyle['blendMode'] {
    return this._rawValue.style?.blendMode
  }

  get opacity(): DefinedStyle['opacity'] {
    return this._rawValue.style?.opacity
  }

  get fixed(): DefinedUx['fixed'] {
    return this._rawValue.meta?.ux?.fixed
  }

  get style(): RawLayer['style'] {
    return this._rawValue.style
  }

  get raw(): RawLayer {
    return this._rawValue
  }
}
