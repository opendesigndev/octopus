import SourceDesign from '../source/source-design'

import type { Artboard, OctopusManifestReport } from '../../typings/manifest'
import type OctopusXDConverter from '../..'
import { asArray, asString } from '../../utils/as'
import { traverseAndFind } from '../../utils/common'


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

  private _getArtboardIdByPath(path: string) {
    const regex = /artboard-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/
    const match = path.match(regex)
    return match ? match[1] : null
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
    return asArray(artwork.children?.filter(child => /^artboard-/.test(child.path)), [])
  }

  private _getArtboardAssetsImages(raw: object) {
    const entries = traverseAndFind(raw, (obj: unknown) => {
      return Object(obj)?.style?.fill?.pattern?.meta?.ux?.uid
    })
    return [ ...new Set(entries) ]
  }

  private _getArtboardAssetsFonts(raw: object) {
    const entries = traverseAndFind(raw, (obj: unknown) => {
      return Object(obj)?.postscriptName
    })
    return [ ...new Set(entries) ]
  }

  private _getArtboardAssets(artboardId: string) {
    const targetArtboard = this._sourceDesign.getArtboardById(artboardId)
    const raw = targetArtboard?.raw
    if (!raw) return null
    
    const images = this._getArtboardAssetsImages(raw).map(image => {
      return {
        location: '', /** @TODO should be optional? */
        refId: image
      }
    })
    const fonts = this._getArtboardAssetsFonts(raw).map(font => {
      return {
        location: '', /** @TODO should be optional? */
        name: font
      }
    })

    return {
      ...(images.length ? { images } : null),
      ...(fonts.length ? { fonts } : null)
    }
  }

  get artboards() {
    return this.manifestArtboardEntries.map(artboard => {
      const id = this._getArtboardIdByPath(artboard.path)
      if (!id) return null
      return {
        id,
        name: artboard.name,
        bounds: this._convertManifestBounds(artboard['uxdesign#bounds']),
        dependencies: [],
        location: {
          type: 'LOCAL_RESOURCE',
          path: '' /** @TODO should we make location optional? because generation can be done in-memory */
        },
        assets: this._getArtboardAssets(id)
      }
    }).filter(artboardEntry => artboardEntry) as Artboard[]
  }

  /** @TODO should we output pages or just artboards are enough? */
  get pages() {
    const artboardIds = this.artboards.map(artboard => {
      return {
        id: artboard.id,
        type: 'ARTBOARD'
      } as const
    })

    const artificialPage = {
      id: OctopusManifest.DEFAULT_PAGE_ID,
      name: OctopusManifest.DEFAULT_PAGE_NAME,
      children: artboardIds,
    }
    return [ artificialPage ]
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
      pages: this.pages,
      artboards: this.artboards,
      components: [],
      chunks: [],
      libraries: []
    }
  }
}