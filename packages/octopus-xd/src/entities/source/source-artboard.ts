import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo'
import { asArray } from '@opendesign/octopus-common/dist/utils/as'
import { push, traverseAndFind } from '@opendesign/octopus-common/dist/utils/common'

import { createSourceLayer } from '../../factories/create-source-layer'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { RawArtboard, RawArtboardEntry, RawLayer } from '../../typings/source'
import type { SourceDesign } from './source-design'
import type { RawArtboardSpecific, RawGeneralEntry } from './source-manifest'

export type SourceArtboardOptions = {
  rawValue: RawArtboard
  path: string
  design: SourceDesign
}

export class SourceArtboard {
  private _rawValue: RawArtboard
  private _path: string
  private _design: SourceDesign
  private _children: SourceLayer[]

  constructor(options: SourceArtboardOptions) {
    this._design = options.design
    this._path = options.path
    this._rawValue = options.rawValue as RawArtboard
    this._children = this._initChildren()
  }

  private _getManifestEntryByPath() {
    const manifestEntry = this._design.manifest.getArtboardEntryByPartialPath(this._path)
    if (!manifestEntry) {
      throw new Error(`Can't resolve manifest entry for artboard at ${this._path}`)
    }
    return manifestEntry
  }

  private _getArtboardAssetsImages(): string[] {
    const entries = traverseAndFind(this._rawValue, (obj: unknown) => {
      return Object(obj)?.style?.fill?.pattern?.meta?.ux?.uid
    })
    return [...new Set(entries)] as string[]
  }

  private _getArtboardAssetsFonts(): string[] {
    const entries = traverseAndFind(this._rawValue, (obj: unknown) => {
      return Object(obj)?.postscriptName
    })
    return [...new Set(entries)] as string[]
  }

  @firstCallMemo()
  get dependencies(): { images: string[]; fonts: string[] } {
    return {
      images: this._getArtboardAssetsImages(),
      fonts: this._getArtboardAssetsFonts(),
    }
  }

  private _initChildren() {
    const children = asArray(this.firstChild?.artboard?.children)
    return children.reduce((children: SourceLayer[], layer: RawLayer) => {
      const sourceLayer = createSourceLayer({
        layer,
        parent: this,
      })
      return sourceLayer ? push(children, sourceLayer) : children
    }, [])
  }

  get raw(): RawArtboard {
    return this._rawValue
  }

  get path(): string {
    return this._path
  }

  get meta(): RawGeneralEntry & RawArtboardSpecific & { id: string; internalId: string | null } {
    const manifestEntry = this._getManifestEntryByPath()
    const internalId = this._rawValue.children?.[0]?.id || this._rawValue.children?.[0]?.artboard?.ref || null
    const manifestId = manifestEntry.id
    return {
      ...manifestEntry,
      // id: manifestId,
      // internalId,
      /**
       * `id` fallbacks to `manifestId` - that's the case when pasteboard has `null` as internalId.
       */
      id: internalId ?? manifestId,
      internalId: manifestId,
    }
  }

  /**
   * Helper to access first "real" artboard object.
   */
  get firstChild(): RawArtboardEntry | null {
    return this._rawValue.children?.[0] || null
  }

  get refId(): string | null {
    return this.firstChild?.artboard?.ref || null
  }

  get guides(): { x: number[]; y: number[] } | null {
    const guides = this.firstChild?.meta?.ux?.guidesModel
    if (!guides) return null

    return {
      x: asArray(guides.horizontalGuides?.guides).reduce((guidesX, guide) => {
        if (typeof guide?.position !== 'number') return guidesX
        return push(guidesX, guide.position)
      }, []),
      y: asArray(guides.verticalGuides?.guides).reduce((guidesY, guide) => {
        if (typeof guide?.position !== 'number') return guidesY
        return push(guidesY, guide.position)
      }, []),
    }
  }

  get children(): SourceLayer[] {
    return this._children
  }
}
