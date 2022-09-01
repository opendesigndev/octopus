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
    // const bounds = this.sourceArtboard.boundingBox
    const bounds = this.sourceArtboard.bounds // TODO remove when ISSUE is fixed https://gitlab.avcd.cz/opendesign/open-design-engine/-/issues/21
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

  get layers(): OctopusLayer[] {
    return this._layers
  }

  private get _content(): Octopus['MaskGroupLayer'] | undefined {
    const sourceLayer = this.sourceArtboard.sourceFrame
    const maskGroup = OctopusLayerMaskGroup.createBackgroundMaskGroup({ sourceLayer, parent: this, isArtboard: true })
    return maskGroup?.convert() ?? undefined
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
