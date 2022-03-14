import { SourceDesign } from '../source/source-design'
import type { Artboard, Assets, OctopusManifestReport } from '../../typings/manifest'
import type { OctopusPSDConverter } from '../..'
import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import { SourceBounds } from '../../typings/source'

type OctopusManifestOptions = {
  sourceDesign: SourceDesign
  octopusConverter: OctopusPSDConverter
}

export class OctopusManifest {
  private _sourceDesign: SourceDesign
  private _octopusConverter: OctopusPSDConverter

  static DEFAULT_PAGE_ID = '1'
  static DEFAULT_PAGE_NAME = 'Page'

  constructor(options: OctopusManifestOptions) {
    this._sourceDesign = options.sourceDesign
    this._octopusConverter = options.octopusConverter
  }

  get manifestVersion(): Promise<string> {
    return this._octopusConverter.pkgVersion
  }

  get psdVersion(): string {
    return '0' // TODO
  }

  get name(): string {
    return this._sourceDesign.designId
  }

  private _convertManifestBounds(bounds: SourceBounds) {
    return {
      x: bounds.left,
      y: bounds.top,
      w: bounds.width,
      h: bounds.height,
    }
  }

  private _getArtboardAssets(): Assets {
    return {} // TODO
  }

  @firstCallMemo()
  get artboards(): Artboard[] {
    const sourceArtboard = this._sourceDesign.artboard
    const id = sourceArtboard.id
    const bounds = this._convertManifestBounds(sourceArtboard.bounds)
    const assets = this._getArtboardAssets()

    const artboard: Artboard = {
      id,
      name: id,
      bounds,
      dependencies: [],
      assets,
      location: { type: 'TRANSIENT' },
    }
    return [artboard]
  }

  /** @TODO guard with official types */
  async convert(): Promise<OctopusManifestReport> {
    return {
      version: await this.manifestVersion,
      origin: {
        name: 'photoshop',
        version: this.psdVersion,
      },
      name: this.name,
      pages: [],
      artboards: this.artboards,
      components: [],
      chunks: [],
      libraries: [],
    }
  }
}
