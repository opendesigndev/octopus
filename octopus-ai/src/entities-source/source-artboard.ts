import _ from 'lodash'
import { RawArtboardEntry } from '../typings/source/artboard'
import { asArray, asNumber } from '@avocode/octopus-common/dist/utils/as'
import { createSourceLayer, SourceLayer } from '../factories/create-source-layer'
import { RawLayer } from '../typings/source/layer'
import SourceResources from './source-resources'
import { Nullable } from '../typings/helpers'
import { Octopus } from '../typings/octopus'

export default class SourceArtboard {
  private _rawArtboard: RawArtboardEntry
  private _children: SourceLayer[]
  private _id: string
  private _resources: SourceResources

  constructor(rawArtboard: RawArtboardEntry, id: number) {
    this._id = String(id)
    this._rawArtboard = rawArtboard
    this._children = this._initChildren()
    this._resources = new SourceResources({ rawValue: this._rawArtboard.Resources })
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

  public get layers(): SourceLayer[] {
    return this._children
  }

  public get id(): string {
    return this._id
  }

  public get name(): Nullable<string> {
    return this._rawArtboard.Name
  }

  get children(): Nullable<SourceLayer[]> {
    return this._children
  }

  get dimensions(): Octopus['Dimensions'] {
    const [, , width, height] = asArray(this._rawArtboard.MediaBox)

    return {
      width: asNumber(width, 0),
      height: asNumber(height, 0),
    }
  }

  get resources(): SourceResources {
    return this._resources
  }

  get hiddenContentObjectIds(): RawArtboardEntry['OCProperties.D.OFF'] {
    return this._rawArtboard['OCProperties.D.OFF']
  }
}
