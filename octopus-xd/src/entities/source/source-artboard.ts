import { asArray, asString } from '@avocode/octopus-common/dist/utils/as'
import { createSourceLayer } from '../../factories/create-source-layer'

import type SourceDesign from './source-design'
import type { RawArtboard, RawLayer } from '../../typings/source'
import type { SourceLayer } from '../../factories/create-source-layer'


export type SourceArtboardOptions = {
  rawValue: RawArtboard,
  path: string,
  design: SourceDesign
}

export default class SourceArtboard {
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

  private _initChildren() {
    const children = asArray(this.firstChild?.artboard?.children)
    return children.reduce((children: SourceLayer[], layer: RawLayer) => {
      const sourceLayer = createSourceLayer({
        layer,
        parent: this
      })
      return sourceLayer ? [...children, sourceLayer] : children
    }, [])
  }

  get raw() {
    return this._rawValue
  }

  get path() {
    return this._path
  }

  get meta() {
    const manifestEntry = this._getManifestEntryByPath()
    const internalId = this._rawValue.children?.[0]?.artboard?.ref || null
    const manifestId = manifestEntry.id
    return {
      ...manifestEntry,
      id: manifestId,
      internalId
    }
  }

  /**
   * Helper to access first "real" artboard object.
   */
  get firstChild() {
    return this._rawValue.children?.[0] || null
  }

  get refId() {
    return this.firstChild?.artboard?.ref || null
  }

  get guides() {
    const guides = this.firstChild?.meta?.ux?.guidesModel
    if (!guides) return null

    return {
      x: asArray(guides.horizontalGuides?.guides).reduce((guidesX, guide) => {
        if (typeof guide?.position !== 'number') return guidesX
        return [...guidesX, guide.position]
      }, []),
      y: asArray(guides.verticalGuides?.guides).reduce((guidesY, guide) => {
        if (typeof guide?.position !== 'number') return guidesY
        return [...guidesY, guide.position]
      }, [])
    }
  }

  get children() {
    return this._children
  }
}