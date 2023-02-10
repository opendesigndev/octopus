import path from 'path'

import { firstCallMemo } from '@opendesign/octopus-common/decorators/first-call-memo'
import { asArray, asFiniteNumber, asNumber } from '@opendesign/octopus-common/utils/as'
import { traverseAndFind } from '@opendesign/octopus-common/utils/common'

import { initSourceLayerChildren, uniqueIdFactory } from '../../utils/layer'
import { SourceResources } from './source-resources'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { RawObjectId } from '../../typings/raw'
import type { RawArtboardEntry, RawArtboardMediaBox } from '../../typings/raw/artboard'
import type { SourceDesign } from './source-design'
import type { Nullish } from '@opendesign/octopus-common/utility-types'

type SourceArtboardOptions = { artboard: RawArtboardEntry; sourceDesign: SourceDesign }
export class SourceArtboard {
  private _rawArtboard: RawArtboardEntry
  private _children: SourceLayer[]
  private _id: string
  private _resources: SourceResources
  private _sourceDesign: SourceDesign
  private _uniqueId: () => string

  constructor({ artboard, sourceDesign }: SourceArtboardOptions) {
    this._rawArtboard = artboard
    this._resources = new SourceResources({ rawValue: this._rawArtboard.Resources })
    this._sourceDesign = sourceDesign
    this._id = sourceDesign.uniqueId()
    this._uniqueId = uniqueIdFactory(0, this._id)
    this._children = this._initChildren()
  }

  get sourceDesign() {
    return this._sourceDesign
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

  get name(): Nullish<string> {
    return this._rawArtboard.Name
  }

  get children(): Nullish<SourceLayer[]> {
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

  get hiddenContentIds(): number[] {
    return asArray(this.hiddenContentObjectIds, [])
      .map((c) => c.ObjID)
      .filter((id) => asFiniteNumber(id)) as number[]
  }

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

  get uniqueId() {
    return this._uniqueId
  }
}
