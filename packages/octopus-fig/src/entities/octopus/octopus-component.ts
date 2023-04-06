import { createOctopusLayer } from '../../factories/create-octopus-layer.js'
import { env } from '../../services/index.js'
import { convertId } from '../../utils/convert.js'

import type { OctopusManifest } from './octopus-manifest.js'
import type { SourceLayer } from '../../factories/create-source-layer.js'
import type { DesignConverter } from '../../services/conversion/design-converter.js'
import type { Octopus } from '../../typings/octopus.js'
import type { SourceArtboard } from '../source/source-artboard.js'

type OctopusComponentOptions = {
  designConverter: DesignConverter
  source: SourceArtboard
}

export class OctopusComponent {
  private _designConverter: DesignConverter
  private _sourceArtboard: SourceArtboard

  constructor(options: OctopusComponentOptions) {
    this._designConverter = options.designConverter
    this._sourceArtboard = options.source
  }

  get parentComponent(): OctopusComponent {
    return this
  }

  get sourceArtboard(): SourceArtboard {
    return this._sourceArtboard
  }

  get sourceLayer(): SourceLayer {
    return this.sourceArtboard.sourceLayer
  }

  get designConverter(): DesignConverter {
    return this._designConverter
  }

  get octopusManifest(): OctopusManifest {
    return this.designConverter.octopusManifest
  }

  get dimensions(): Octopus['Dimensions'] | undefined {
    const bounds = env.NODE_ENV === 'debug' ? this.sourceArtboard.bounds : this.sourceArtboard.boundingBox // TODO remove when ISSUE is fixed https://gitlab.avcd.cz/opendesign/open-design-engine/-/issues/21
    if (!bounds) return undefined
    const { width, height } = bounds
    return { width, height }
  }

  get id(): string {
    return convertId(this.sourceArtboard.id)
  }

  get version(): string {
    return this._designConverter.pkgMeta.octopusSpecVersion
  }

  private async _content(): Promise<Octopus['Layer'] | undefined> {
    const sourceLayer = this.sourceLayer
    const layer = createOctopusLayer({ parent: this, layer: sourceLayer })
    const converted = await layer?.convert()
    return converted ?? undefined
  }

  async convert(): Promise<Octopus['OctopusComponent']> {
    return {
      id: this.id,
      type: 'OCTOPUS_COMPONENT',
      version: this.version,
      dimensions: this.dimensions,
      content: await this._content(),
    } as Octopus['OctopusComponent']
  }
}
