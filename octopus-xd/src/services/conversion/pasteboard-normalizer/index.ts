import { asString } from '@avocode/octopus-common/dist/utils/as'
import SourceManifest from '../../../entities/source/source-manifest'
import { RawArtboard, RawPasteboard } from '../../../typings/source'

type PasteboardNormalizerOptions = {
  manifest: SourceManifest,
  pasteboard: RawPasteboard
}

export default class PasteboardNormalizer {
  private _pasteboard: RawPasteboard
  private _manifest: SourceManifest

  constructor(options: PasteboardNormalizerOptions) {
    this._pasteboard = options.pasteboard
    this._manifest = options.manifest
  }

  normalize() {
    const manifestEntry = this._manifest.getArtboardEntryByPartialPath('pasteboard')
    if (!manifestEntry) {
      throw new Error('Missing manifest entry for pasteboard')
    }
    return {
      version: asString(this._pasteboard.version),
      children: [{
        type: 'artboard',
        id: manifestEntry.id,
        artboard: {
          children: this._pasteboard.children,
        }
      }],
      resources: this._pasteboard.resources,
      artboards: this._pasteboard.artboards
    } as RawArtboard
  }
}
