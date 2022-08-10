import { getConverted } from '@avocode/octopus-common/dist/utils/common'

import { createOctopusLayers } from '../../factories/create-octopus-layer.js'
import { convertId, convertRectangle } from '../../utils/convert.js'
import { OctopusFill } from './octopus-fill.js'
import { OctopusLayerBase } from './octopus-layer-base.js'
import { OctopusStroke } from './octopus-stroke.js'

import type { OctopusLayer } from '../../factories/create-octopus-layer.js'
import type { Octopus } from '../../typings/octopus.js'
import type { SourceLayerFrame } from '../source/source-layer-frame.js'
import type { OctopusLayerParent } from './octopus-layer-base.js'

// type OctopusLayerMaskGroupOptions = {
//   parent: OctopusLayerParent
//   id: string
//   mask: OctopusLayer
//   layers: OctopusLayer[]
//   maskBasis?: Octopus['MaskBasis']
// }

type OctopusLayerMaskGroupOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerFrame
}

type CreateBackgroundOptions = {
  // parent: OctopusLayerParent
  frame: SourceLayerFrame
  layers: OctopusLayer[]
  isArtboard?: boolean
}
export class OctopusLayerMaskGroup extends OctopusLayerBase {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerFrame
  private _layers: OctopusLayer[]

  // private _parent: OctopusLayerParent
  // private _id: string
  // private _mask: OctopusLayer
  // private _layers: OctopusLayer[]
  // private _maskBasis: Octopus['MaskBasis']

  static createBackgroundMask(frame: SourceLayerFrame): Octopus['Layer'] | null {
    if (!frame.size) return null

    const id = convertId(frame.id)
    const rectangle = convertRectangle(frame.size)
    const cornerRadius = frame.cornerRadius
    const fills = OctopusFill.convertFills(frame.fills, frame)
    const strokes = OctopusStroke.convertStrokes(frame.strokes, frame)
    return {
      id: `${id}-BackgroundMask`,
      type: 'SHAPE' as const,
      visible: fills.length > 0 || strokes.length > 0,
      shape: { path: { type: 'RECTANGLE', rectangle, cornerRadius }, fills, strokes },
    }
  }

  static createBackground({
    // parent,
    frame,
    layers,
    isArtboard = false,
  }: CreateBackgroundOptions): Octopus['MaskGroupLayer'] | null {
    const id = convertId(frame.id)
    const mask = OctopusLayerMaskGroup.createBackgroundMask(frame)
    if (!mask) return null

    const meta = isArtboard ? { isArtboard } : undefined
    const visible = true // TODO
    return {
      id, //: `${id}-Background`, // TODO
      type: 'MASK_GROUP',
      maskBasis: 'BODY',
      mask,
      layers: getConverted(layers),
      meta,
      visible,
    }
  }

  constructor(options: OctopusLayerMaskGroupOptions) {
    super(options)
    this._layers = createOctopusLayers(this._sourceLayer.layers, this)
  }

  // constructor(options: OctopusLayerMaskGroupOptions) {
  //   this._parent = options.parent
  //   this._id = options.id
  //   this._mask = options.mask
  //   this._layers = options.layers
  //   this._maskBasis = options.maskBasis ?? 'BODY'
  // }

  get sourceLayer(): SourceLayerFrame {
    return this._sourceLayer
  }

  // get id(): string {
  //   return convertId(this._id)
  // }

  // get parentArtboard(): OctopusArtboard {
  //   const parent = this._parent as OctopusLayerParent
  //   return parent instanceof OctopusArtboard ? parent : parent.parentArtboard
  // }

  private get _maskBasis() {
    return 'BODY' as const // TODO
  }

  get type(): 'MASK_GROUP' {
    return 'MASK_GROUP'
  }

  convert(): Octopus['MaskGroupLayer'] | null {
    const mask = OctopusLayerMaskGroup.createBackgroundMask(this.sourceLayer)
    if (!mask) return null

    return {
      id: this.id,
      type: this.type,
      maskBasis: this._maskBasis,
      mask,
      transform: this.transform,
      layers: getConverted(this._layers),
    } as const
  }
}
