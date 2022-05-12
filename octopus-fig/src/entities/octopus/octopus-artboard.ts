import { getConverted } from '@avocode/octopus-common/dist/utils/common'

import { createOctopusLayers, OctopusLayer } from '../../factories/create-octopus-layer'

import type { OctopusFigConverter } from '../..'
import type { Octopus } from '../../typings/octopus'
import type { SourceArtboard } from '../source/source-artboard'
import type { SourceDesign } from '../source/source-design'

type OctopusArtboardOptions = {
  targetArtboardId: string
  octopusConverter: OctopusFigConverter
}

export class OctopusArtboard {
  private _octopusConverter: OctopusFigConverter
  private _sourceArtboard: SourceArtboard
  private _layers: OctopusLayer[]

  constructor(options: OctopusArtboardOptions) {
    const artboard = options.octopusConverter.sourceDesign.getArtboardById(options.targetArtboardId)
    if (!artboard) throw new Error(`Can't find target artboard by id "${options.targetArtboardId}"`)
    this._sourceArtboard = artboard
    this._octopusConverter = options.octopusConverter
    this._layers = createOctopusLayers(this.sourceArtboard.layers, this)
  }

  get parentArtboard(): OctopusArtboard {
    return this
  }

  get sourceArtboard(): SourceArtboard {
    return this._sourceArtboard
  }

  get converter(): OctopusFigConverter {
    return this._octopusConverter
  }

  get sourceDesign(): SourceDesign {
    return this.converter.sourceDesign
  }

  get dimensions(): Octopus['Dimensions'] | undefined {
    const bounds = this.sourceArtboard.bounds
    if (!bounds) return undefined
    const { width, height } = bounds
    return { width, height }
  }

  get id(): string {
    return this.sourceArtboard.id
  }

  get version(): Promise<string> {
    return this.converter.pkgVersion
  }

  private get _content(): Octopus['GroupLayer'] {
    return {
      id: `${this.id}:background`,
      name: this.sourceArtboard.name,
      type: 'GROUP',
      layers: getConverted(this._layers),
    } // TODO use MaskGroup
  }

  async convert(): Promise<Octopus['OctopusDocument']> {
    return {
      id: this.id,
      type: 'ARTBOARD',
      version: await this.version,
      dimensions: this.dimensions,
      content: this._content,
    } as Octopus['OctopusDocument']
  }
}
