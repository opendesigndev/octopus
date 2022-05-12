import { SourceLayerCommon } from './source-layer-common'

import type { RawLayerRectangle } from '../../typings/raw'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerRectangleOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerRectangle
}

export class SourceLayerRectangle extends SourceLayerCommon {
  protected _rawValue: RawLayerRectangle

  constructor(options: SourceLayerRectangleOptions) {
    super(options)
  }

  // TODO

  // @firstCallMemo()
  // get path(): SourcePath {
  //   return new SourcePath(this._rawValue.path)
  // }

  // get pathComponents(): SourcePathComponent[] {
  //   return this.path.pathComponents
  // }

  // get firstPathComponent(): SourcePathComponent | undefined {
  //   return this.pathComponents[0]
  // }

  // get pathBounds(): SourceBounds {
  //   return this.path.bounds
  // }

  // @firstCallMemo()
  // get fill(): SourceEffectFill {
  //   return new SourceEffectFill(this._rawValue.fill, this._rawValue.strokeStyle?.fillEnabled)
  // }

  // @firstCallMemo()
  // get stroke(): SourceStroke {
  //   return new SourceStroke(this._rawValue.strokeStyle)
  // }
}
