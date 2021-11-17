import { RawArtboard, RawLayer } from '../typings/source'
import { asArray } from '../utils/as'
import SourceDesign from './source-design'
import { createSourceLayer, SourceLayer } from '../factories/source-layer'


export type SourceArtboardOptions = {
  rawValue: RawArtboard,
  path: string,
  design: SourceDesign
}

export default class SourceArtboard {
  _rawValue: RawArtboard
  _path: string
  _design: SourceDesign
  _children: SourceLayer[]

  constructor(options: SourceArtboardOptions) {
    this._design = options.design
    this._path = options.path
    this._rawValue = options.rawValue
    this._children = this._initChildren()
  }

  _initChildren() {
    const children = asArray(this.firstChild?.artboard?.children)
    return children.reduce((children: SourceLayer[], layer: RawLayer) => {
      const sourceLayer = createSourceLayer({
        layer,
        parent: this
      })
      return sourceLayer ? [ ...children, sourceLayer ] : children
    }, [])
  }

  get raw() {
    return this._rawValue
  }

  get meta() {
    const manifestEntry = this._design.manifest.getArtboardEntryByPartialPath(this._path)
    if (!manifestEntry) {
      throw new Error(`Can't resolve manifest entry for artboard at ${this._path}`)
    }
    const internalId = this._rawValue.children?.[0]?.artboard?.ref
    const manifestId = manifestEntry.id
    if (!internalId) {
      throw new Error(`Can't resolve internal id ("ref") of artboard at ${this._path}`)
    }
    return {
      ...manifestEntry,
      id: internalId,
      manifestId
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
        return [ ...guidesX, guide.position ]
      }, []),
      y: asArray(guides.verticalGuides?.guides).reduce((guidesY, guide) => {
        if (typeof guide?.position !== 'number') return guidesY
        return [ ...guidesY, guide.position ]
      }, [])
    }
  }

  get children() {
    return this._children
  }
}