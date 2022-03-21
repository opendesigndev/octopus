import { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'
import { RawMetadata } from '../../typings/raw'

export default class SourceMetadata {
  private _raw: RawMetadata
  constructor(rawValue: RawMetadata) {
    this._raw = rawValue
  }

  get raw(): RawMetadata {
    return this._raw
  }

  get name(): Nullable<string> {
    const metadataArtboard = Object.values(this._raw?.Artboards ?? {})[0]
    return metadataArtboard?.Name
  }

  get version(): Nullable<string> {
    return this._raw.Version
  }
}
