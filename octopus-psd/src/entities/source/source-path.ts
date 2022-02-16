import type { RawPath } from '../../typings/raw'
import { getBoundsFor } from '../../utils/source'
import { SourcePathComponent } from './source-path-component'

export class SourcePath {
  protected _rawValue: RawPath | undefined

  constructor(path: RawPath | undefined) {
    this._rawValue = path
  }

  get bounds() {
    return getBoundsFor(this._rawValue?.bounds)
  }

  get pathComponents() {
    const components = this._rawValue?.pathComponents ?? []
    return components.map((component) => new SourcePathComponent(component))
  }
}
