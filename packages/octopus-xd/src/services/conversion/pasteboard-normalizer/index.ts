import { asString } from '@opendesign/octopus-common/utils/as'

import type { SourceManifest } from '../../../entities/source/source-manifest'
import type { RawArtboard, RawPasteboard } from '../../../typings/source'

type PasteboardNormalizerOptions = {
  manifest: SourceManifest
  pasteboard: RawPasteboard
}

export class PasteboardNormalizer {
  private _pasteboard: RawPasteboard
  private _manifest: SourceManifest

  constructor(options: PasteboardNormalizerOptions) {
    this._pasteboard = options.pasteboard
    this._manifest = options.manifest
  }

  normalize(): RawArtboard | null {
    const manifestEntry = this._manifest.getArtboardEntryByPartialPath('pasteboard')
    if (!manifestEntry) {
      throw new Error('Missing manifest entry for pasteboard')
    }

    if (!this._pasteboard.children?.length) return null

    return {
      version: asString(this._pasteboard.version),
      children: [
        {
          type: 'artboard',
          id: manifestEntry.id,
          artboard: {
            children: this._pasteboard.children,
          },
        },
      ],
      resources: this._pasteboard.resources,
      artboards: this._pasteboard.artboards,
    } as RawArtboard
  }
}
