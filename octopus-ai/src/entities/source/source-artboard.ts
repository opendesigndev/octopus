import { asArray, asNumber } from '@avocode/octopus-common/dist/utils/as'

import { createSourceLayer } from '../../factories/create-source-layer'
import SourceResources from './source-resources'

import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'
import type { RawArtboardEntry, RawArtboardMediaBox } from '../../typings/raw/artboard'
import type { SourceLayer } from '../../factories/create-source-layer'
import type { RawLayer } from '../../typings/raw/layer'
import type { RawObjectId, XObjectSubtype } from '../../typings/raw'
import type SourceResourcesXObject from './source-resources-x-object'

export default class SourceArtboard {
  private _rawArtboard: RawArtboardEntry
  private _children: SourceLayer[]
  private _id: string
  private _resources: SourceResources

  constructor(rawArtboard: RawArtboardEntry, id: string) {
    this._id = id
    this._rawArtboard = rawArtboard
    this._resources = new SourceResources({ rawValue: this._rawArtboard.Resources })
    this._children = this._initChildren()
  }

  private _initChildren() {
    const children = asArray(this._rawArtboard?.Contents?.Data)
    return children.reduce((children: SourceLayer[], layer: RawLayer, i: number) => {
      const sourceLayer = createSourceLayer({
        layer,
        parent: this,
        path: [i],
      })
      return sourceLayer ? [...children, sourceLayer] : children
    }, [])
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

  getResourcesXObject(xObjectName: string): Nullable<SourceResourcesXObject> {
    return this._resources?.getXObject(xObjectName)
  }

  getResourcesXObjectSubtype(xObjectName: string): Nullable<XObjectSubtype> {
    return this._resources?.getXObject(xObjectName)?.subType
  }
}
