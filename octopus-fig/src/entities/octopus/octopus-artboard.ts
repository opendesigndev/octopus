import { createOctopusLayers } from '../../factories/create-octopus-layer'
import { convertId } from '../../utils/convert'
import { OctopusLayerMaskGroup } from './octopus-layer-mask-group'

import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { Octopus } from '../../typings/octopus'
import type { SourceArtboard } from '../source/source-artboard'

type OctopusArtboardOptions = {
  sourceArtboard: SourceArtboard
  version: string
}

export class OctopusArtboard {
  private _sourceArtboard: SourceArtboard
  private _version: string
  private _layers: OctopusLayer[]

  constructor(options: OctopusArtboardOptions) {
    this._sourceArtboard = options.sourceArtboard
    this._version = options.version
    this._layers = createOctopusLayers(this.sourceArtboard.layers, this)
  }

  get parentArtboard(): OctopusArtboard {
    return this
  }

  get sourceArtboard(): SourceArtboard {
    return this._sourceArtboard
  }

  get dimensions(): Octopus['Dimensions'] | undefined {
    const bounds = this.sourceArtboard.bounds
    if (!bounds) return undefined
    const { width, height } = bounds
    return { width, height }
  }

  get id(): string {
    return convertId(this.sourceArtboard.id)
  }

  get version(): string {
    return this._version
  }

  private get _content(): Octopus['MaskGroupLayer'] | undefined {
    // console.info('')

    const isArtboard = true // TODO
    const background = OctopusLayerMaskGroup.createBackground({
      // parent: this.parentArtboard,
      frame: this.sourceArtboard.sourceFrame,
      layers: this._layers,
      isArtboard,
    })

    if (!background) return
    return background

    // return {
    //   id: `${this.id}-background`,
    //   name: this.sourceArtboard.name,
    //   type: 'GROUP',
    //   layers: getConverted(this._layers),
    //   blendMode: convertBlendMode(this.sourceArtboard.blendMode),
    //   opacity: this.sourceArtboard.opacity,
    // } // TODO use MaskGroup
  }

  async convert(): Promise<Octopus['OctopusDocument']> {
    return {
      id: this.id,
      type: 'ARTBOARD',
      version: this.version,
      dimensions: this.dimensions,
      content: this._content,
    } as Octopus['OctopusDocument']
  }
}
