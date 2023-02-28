import type { Defined } from '../../typings/helpers.js'
import type { RawShapeLayer } from '../../typings/source/index.js'
import type { RawResources } from '../../typings/source/resources.js'
import type { SourceDesign } from './source-design.js'

type SourceResourcesOptions = {
  rawValue: RawResources
  path: string
  design: SourceDesign
}

export class SourceResources {
  protected _rawValue: RawResources
  private _path: string
  private _design: SourceDesign

  constructor(options: SourceResourcesOptions) {
    this._design = options.design
    this._rawValue = options.rawValue
    this._path = options.path
  }

  get raw(): RawResources {
    return this._rawValue
  }

  get clipPaths(): Defined<Defined<RawResources>['resources']>['clipPaths'] | null {
    return this.raw?.resources?.clipPaths || null
  }

  getClipPathById(id: string): RawShapeLayer | null {
    return this.clipPaths?.[id]?.children?.[0] || null
  }
}
