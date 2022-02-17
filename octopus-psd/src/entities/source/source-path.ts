import type { RawPath } from '../../typings/raw'
import type { SourceBounds } from '../../typings/source'
import { getBoundsFor } from '../../utils/source'
import { SourcePathComponent } from './source-path-component'

export class SourcePath {
  protected _rawValue: RawPath | undefined

  constructor(path: RawPath | undefined) {
    this._rawValue = path
  }

  get bounds(): SourceBounds {
    return getBoundsFor(this._rawValue?.bounds)
  }

  get pathComponents(): SourcePathComponent[] {
    const components = this._rawValue?.pathComponents ?? []
    return components.map((component) => new SourcePathComponent(component))
  }
}
