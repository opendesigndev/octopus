import SourceDesign from '../source/source-design'

import type { Artboard, OctopusManifestReport } from '../../typings/manifest'
import type OctopusXDConverter from '../..'
import { asArray, asString } from '@avocode/octopus-common/dist/utils/as'
import { traverseAndFind } from '@avocode/octopus-common/dist/utils/common'
import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'


type OctopusManifestOptions = {
  sourceDesign: SourceDesign,
  octopusXdConverter: OctopusXDConverter
}

type RawManifestBounds = {
  x: number,
  y: number,
  width: number,
  height: number
}

export default class OctopusManifest {
  private _sourceDesign: SourceDesign
  private _octopusXdConverter: OctopusXDConverter

  static DEFAULT_PAGE_ID = '1'
  static DEFAULT_PAGE_NAME = 'Page'

  constructor(options: OctopusManifestOptions) {
    this._sourceDesign = options.sourceDesign
    this._octopusXdConverter = options.octopusXdConverter
  }

  get manifestVersion() {
    return this._octopusXdConverter.pkg.then(pkg => pkg.version)
  }

  get xdVersion() {
    return asString(this._sourceDesign.manifest.xdVersion, '0')
  }

  get name() {
    return asString(this._sourceDesign.manifest.name, 'Untitled')
  }

  private _convertManifestBounds(bounds: RawManifestBounds) {
    return {
      x: bounds.x,
      y: bounds.y,
      w: bounds.width,
      h: bounds.height
    }
  }

  private get manifestArtboardEntries() {
    const artwork = asArray(this._sourceDesign.manifest.raw?.children).find(child => {
      return child.path === 'artwork'
    })
    if (!artwork) return []
    return asArray(artwork.children?.filter(child => {
      return /^artboard-/.test(child.path) || /pasteboard/.test(child.path)
    }), [])
  }

  private _getArtboardAssetsImages(raw: object) {
    const entries = traverseAndFind(raw, (obj: unknown) => {
      return Object(obj)?.style?.fill?.pattern?.meta?.ux?.uid
    })
    return [...new Set(entries)]
  }

  private _getArtboardAssetsFonts(raw: object) {
    const entries = traverseAndFind(raw, (obj: unknown) => {
      return Object(obj)?.postscriptName
    })
    return [...new Set(entries)]
  }

  private _getArtboardAssets(artboardId: string) {
    const targetArtboard = this._sourceDesign.getArtboardById(artboardId)
    const raw = targetArtboard?.raw
    if (!raw) return null

    const images = this._getArtboardAssetsImages(raw).map(image => {
      return {
        location: {
          type: 'TRANSIENT'
        },
        refId: image
      }
    })
    const fonts = this._getArtboardAssetsFonts(raw).map(font => {
      return {
        location: {
          type: 'TRANSIENT'
        },
        name: font
      }
    })

    return {
      ...(images.length ? { images } : null),
      ...(fonts.length ? { fonts } : null)
    }
  }

  @firstCallMemo()
  get artboards() {
    return this.manifestArtboardEntries.map(artboard => {
      const id = artboard.id
      if (!id) return null

      const pasteboard = artboard.path === 'pasteboard'
        ? { isPasteboard: true }
        : null
      const bounds = artboard.path === 'pasteboard'
        ? null
        : { bounds: this._convertManifestBounds(artboard['uxdesign#bounds']) }

      return {
        id,
        name: artboard.name,
        ...bounds,
        dependencies: [],
        location: {
          type: 'TRANSIENT'
        },
        assets: this._getArtboardAssets(id),
        ...pasteboard
      }
    }).filter(artboardEntry => artboardEntry) as Artboard[]
  }

  /** @TODO guard with official types */
  async convert(): Promise<OctopusManifestReport> {
    return {
      version: await this.manifestVersion,
      origin: {
        name: 'xd',
        version: this.xdVersion
      },
      name: this.name,
      pages: [],
      artboards: this.artboards,
      components: [],
      chunks: [],
      libraries: []
    }
  }
}