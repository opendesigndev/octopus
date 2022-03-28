import type { OctopusPSDConverter } from '../..'
import type { Octopus } from '../../typings/octopus'
import { OctopusLayer, createOctopusLayers } from '../../factories/create-octopus-layer'
import type { SourceArtboard } from '../source/source-artboard'
import { getConverted } from '@avocode/octopus-common/dist/utils/common'
import type { SourceDesign } from '../source/source-design'
import { OctopusLayerMaskGroup } from './octopus-layer-mask-group'

type OctopusArtboardOptions = {
  sourceDesign: SourceDesign
  octopusConverter: OctopusPSDConverter
}

export class OctopusArtboard {
  private _sourceDesign: SourceDesign
  private _octopusConverter: OctopusPSDConverter
  private _layers: OctopusLayer[]

  constructor(options: OctopusArtboardOptions) {
    this._octopusConverter = options.octopusConverter
    this._sourceDesign = options.sourceDesign
    this._layers = createOctopusLayers(this.sourceArtboard.layers, this)
  }

  get parentArtboard(): OctopusArtboard {
    return this
  }

  get sourceArtboard(): SourceArtboard {
    return this._sourceDesign.artboard
  }

  get sourceDesign(): SourceDesign {
    return this._sourceDesign
  }

  get converter(): OctopusPSDConverter {
    return this._octopusConverter
  }

  get dimensions(): { width: number; height: number } {
    const { width, height } = this.sourceArtboard.bounds
    return { width, height }
  }

  get id(): string {
    return this.sourceArtboard.id
  }

  get version(): Promise<string> {
    return this._octopusConverter.pkgVersion
  }

  get layers(): Octopus['Layer'][] {
    return getConverted(this._layers)
  }

  get content(): Octopus['Layer'] {
    const id = this.id
    const { width, height } = this.dimensions
    const layers = this.layers
    return OctopusLayerMaskGroup.virtualBackground({ id, width, height, layers })
  }

  async convert(): Promise<Octopus['OctopusDocument']> {
    return {
      id: this.id,
      type: 'ARTBOARD',
      version: await this.version,
      dimensions: this.dimensions,
      content: this.content,
    } as Octopus['OctopusDocument']
  }
}
