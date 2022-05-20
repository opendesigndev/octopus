import { SourceDocument } from './source-document'
import { SourceMeta } from './source-meta'
import { SourcePage } from './source-page'
import { SourceUser } from './source-user'

import type SketchFormat from '@sketch-hq/sketch-file-format-ts'

type SourceDesignOptions = {
  document: {
    path: string
    rawValue: SketchFormat.Document
  }
  user: {
    path: string
    rawValue: SketchFormat.User
  }
  meta: {
    path: string
    rawValue: SketchFormat.Meta
  }
  images: {
    path: string
    getImageData: () => Promise<Buffer>
  }[]
  pages: {
    path: string
    rawValue: SketchFormat.Page
  }[]
}

type SourceImage = { path: string; getImageData: () => Promise<Buffer> }

export class SourceDesign {
  private _document: SourceDocument
  private _user: SourceUser
  private _meta: SourceMeta
  private _pages: SourcePage[]
  private _images: SourceImage[]

  constructor(options: SourceDesignOptions) {
    this._document = new SourceDocument({
      path: options.document.path,
      rawValue: options.document.rawValue,
      design: this,
    })

    this._user = new SourceUser({
      path: options.user.path,
      rawValue: options.user.rawValue,
      design: this,
    })

    this._meta = new SourceMeta({
      path: options.meta.path,
      rawValue: options.meta.rawValue,
      design: this,
    })

    this._pages = options.pages.map((page) => {
      return new SourcePage({
        path: page.path,
        rawValue: page.rawValue,
        design: this,
      })
    })

    this._images = options.images
  }

  get document(): SourceDocument {
    return this._document
  }

  get meta(): SourceMeta {
    return this._meta
  }

  get user(): SourceUser {
    return this._user
  }

  get pages(): SourcePage[] {
    return this._pages
  }

  get images(): SourceImage[] {
    return this._images
  }
}
