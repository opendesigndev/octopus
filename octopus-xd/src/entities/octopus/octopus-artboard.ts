import { createOctopusLayer } from '../../factories/create-octopus-layer'

import OctopusArtboardDimensions from './octopus-artboard-dimensions'
import OctopusLayerMaskGroup from './octopus-layer-maskgroup'
import SourceLayerGroup from '../source/source-layer-group'
import { uuidv4FromSeed } from '../../utils/id'

import type { Octopus } from '../../typings/octopus'
import type SourceArtboard from '../source/source-artboard'
import type SourceDesign from '../source/source-design'
import type OctopusXDConverter from '../..'
import type { RawShapeLayer, RawShapeMaskGroupLayer } from '../../typings/source'
import OctopusLayerGroup from './octopus-layer-group'


type OctopusArtboardOptions = {
  sourceDesign: SourceDesign,
  targetArtboardId: string,
  octopusXdConverter: OctopusXDConverter
}

export default class OctopusArtboard {
  private _sourceDesign: SourceDesign
  private _sourceArtboard: SourceArtboard
  private _octopusXdConverter: OctopusXDConverter
  private _backgroundRaw: RawShapeLayer

  constructor(options: OctopusArtboardOptions) {
    const artboard = options.sourceDesign.getArtboardById(options.targetArtboardId)
    if (!artboard) {
      throw new Error(`Can't find target artboard by id "${options.targetArtboardId}"`)
    }
    this._octopusXdConverter = options.octopusXdConverter
    this._sourceDesign = options.sourceDesign
    this._sourceArtboard = artboard
    this._backgroundRaw = this._getArtificialMaskGroupMaskLayer()
  }

  get backgroundMaskLayerRaw() {
    return this._backgroundRaw
  }

  get sourceArtboard() {
    return this._sourceArtboard
  }

  get sourceDesign() {
    return this._sourceDesign
  }

  get converter() {
    return this._octopusXdConverter
  }

  private _getDimensions() {
    return new OctopusArtboardDimensions({
      sourceArtboard: this._sourceArtboard
    })
  }

  private async _getVersion() {
    const pkg = await this._octopusXdConverter.pkg
    return pkg.version
  }

  private _getArtificialMaskGroupMaskLayer() {
    const artboardId = this._sourceArtboard.meta.id
    const { w: width, h: height } = this._getDimensions()

    return {
      type: 'shape',
      name: 'Background',
      meta: { ux: { nameL10N: 'SHAPE_RECTANGLE' } },
      id: uuidv4FromSeed(`${artboardId}:backgroundMask`),
      transform: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
      style: this._sourceArtboard.raw.children?.[0].style,
      shape: { type: 'rect', x: 0, y: 0, width, height }
    } as RawShapeLayer
  }

  private _getArtificialMaskGroupRaw() {
    const artboardId = this._sourceArtboard.meta.id

    return {
      type: 'group',
      name: this._sourceArtboard.meta.name,
      meta: {
        ux: {
          nameL10N: 'SHAPE_MASK',
          clipPathResources: {
            children: [this._backgroundRaw],
            type: 'clipPath'
          }
        }
      },
      id: uuidv4FromSeed(`${artboardId}:background`),
      transform: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
      group: {
        children: this._sourceArtboard.firstChild?.artboard?.children
      }
    } as RawShapeMaskGroupLayer
  }

  private _getArtificialMaskGroupSource() {
    return new SourceLayerGroup({
      parent: this._sourceArtboard,
      rawValue: this._getArtificialMaskGroupRaw()
    })
  }

  private _getContent() {
    return /pasteboard/.test(this._sourceArtboard.path)
      ? new OctopusLayerGroup({
        parent: this,
        sourceLayer: this._getArtificialMaskGroupSource()
      })
      : new OctopusLayerMaskGroup({
        parent: this,
        sourceLayer: this._getArtificialMaskGroupSource()
      })
  }

  async convert(): Promise<Octopus['OctopusDocument']> {
    if (typeof this._sourceArtboard.meta.id !== 'string') {
      throw new Error('Artboard \'id\' property is missing.')
    }

    const dimensions = this._getDimensions()
    const dimensionsEntry = dimensions.areValid ? { dimensions: dimensions.convert() } : null
    const content = this._getContent().convert()

    if (!content) {
      throw new Error('Can\'t compile artificial background layer')
    }

    return {
      type: 'ARTBOARD',
      version: await this._getVersion(),
      id: this._sourceArtboard.meta.id,
      ...dimensionsEntry,
      content
    }
  }
}