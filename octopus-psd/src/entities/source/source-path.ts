import type { RawPath } from '../../typings/raw'
import { getBoundsFor } from '../../utils/source'
import { SourcePathComponent } from './source-path-component'

export class SourcePath {
  protected _path: RawPath | undefined

  constructor(path: RawPath | undefined) {
    this._path = path
  }

  get bounds() {
    return getBoundsFor(this._path?.bounds)
  }

  get pathComponents() {
    const components = this._path?.pathComponents ?? []
    return components.map((component) => new SourcePathComponent(component))
  }
}
