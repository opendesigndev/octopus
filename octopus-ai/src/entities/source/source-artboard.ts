import path from 'path'

import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import { asArray, asNumber } from '@avocode/octopus-common/dist/utils/as'
import { traverseAndFind } from '@avocode/octopus-common/dist/utils/common'

import { initSourceLayerChildren } from '../../utils/layer'
import { SourceResources } from './source-resources'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { RawObjectId } from '../../typings/raw'
import type { RawArtboardEntry, RawArtboardMediaBox } from '../../typings/raw/artboard'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

export class SourceArtboard {
  private _rawArtboard: RawArtboardEntry
  private _children: SourceLayer[]
  private _id: string
  private _resources: SourceResources

  constructor(rawArtboard: RawArtboardEntry, id: number) {
    this._id = String(id)
    this._rawArtboard = rawArtboard
    this._resources = new SourceResources({ rawValue: this._rawArtboard.Resources })
    this._children = this._initChildren()
  }

  private _initChildren() {
    return initSourceLayerChildren({
      parent: this,
      layers: this._rawArtboard?.Contents?.Data,
    })
  }

  get layers(): SourceLayer[] {
    return this._children
  }

  get id(): string {
    return this._id
  }

  get name(): Nullable<string> {
    return this._rawArtboard.Name
  }

  get children(): Nullable<SourceLayer[]> {
    return this._children
  }

  get mediaBox(): RawArtboardMediaBox {
    return this._rawArtboard.MediaBox ?? [0, 0, 0, 0]
  }

  get raw(): RawArtboardEntry {
    return this._rawArtboard
  }

  get dimensions(): { width: number; height: number } {
    const [, , width, height] = asArray(this.mediaBox)
    return {
      width: asNumber(width, 0),
      height: asNumber(height, 0),
    }
  }

  get resources(): SourceResources {
    return this._resources
  }

  get hiddenContentObjectIds(): RawObjectId[] {
    return this._rawArtboard.OCProperties?.D?.OFF ?? []
  }

  /**@TODO check fonts when you come to that */
  private _getArtboardAssetsFonts(): string[] {
    const entries = traverseAndFind(this._rawArtboard?.Resources?.Font ?? {}, (obj: unknown) => {
      return Object(obj)?.BaseFont
    })
    return [...new Set(entries)] as string[]
  }

  private _getArtboardAssetsImages(): string[] {
    const entries = traverseAndFind(this._rawArtboard, (obj: unknown) => {
      const image = Object(obj)?.Data?.Image
      if (image) {
        return path.basename(image)
      }
      return undefined
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
}
