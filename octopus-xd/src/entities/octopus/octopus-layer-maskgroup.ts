import { createOctopusLayer } from '../../factories/create-octopus-layer'
import OctopusLayerCommon from './octopus-layer-common'
import { OctopusLayerParent } from '../../typings/octopus-entities'
import { createSourceLayer } from '../../factories/create-source-layer'
import { SourceLayer } from '../../factories/create-source-layer'
import { asNumber, asString } from '@avocode/octopus-common/dist/utils/as'
import { push } from '@avocode/octopus-common/dist/utils/common'

import type { LayerSpecifics } from './octopus-layer-common'
import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type SourceLayerGroup from '../source/source-layer-group'
import type { Octopus } from '../../typings/octopus'
import type OctopusLayerShape from './octopus-layer-shape'
import type { RawGroupLayer, RawShapeLayer, RawShapeMaskGroupLayer } from '../../typings/source'

type OctopusLayerMaskGroupOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerGroup
}

export default class OctopusLayerMaskGroup extends OctopusLayerCommon {
  protected _sourceLayer: SourceLayerGroup
  private _layers: OctopusLayer[]
  private _mask: OctopusLayerShape | null

  static isShapeMaskGroup(layer: SourceLayer): boolean {
    const raw = layer.raw as RawShapeMaskGroupLayer
    const isShapeMaskGroup = raw?.meta?.ux?.nameL10N === 'SHAPE_MASK'
    const hasClipPath = Boolean(raw?.meta?.ux?.clipPathResources)
    return isShapeMaskGroup || hasClipPath
  }

  static isRepeatGrid(layer: SourceLayer): boolean {
    return Boolean((layer.raw as RawGroupLayer)?.meta?.ux?.repeatGrid)
  }

  static isScrollableGroup(layer: SourceLayer): boolean {
    return Boolean((layer.raw as RawGroupLayer)?.meta?.ux?.scrollingType)
  }

  static isMaskGroupLike(layer: SourceLayer): boolean {
    return this.isShapeMaskGroup(layer) || this.isRepeatGrid(layer) || this.isScrollableGroup(layer)
  }

  constructor(options: OctopusLayerMaskGroupOptions) {
    super(options)
    this._mask = this._initMaskLayer()
    this._layers = this._initLayers()
  }

  private _getMaskResourceFromLocalResources() {
    const raw = this._sourceLayer.raw as RawShapeMaskGroupLayer
    return raw?.meta?.ux?.clipPathResources?.children?.[0] || null
  }

  private _getMaskResourceFromGlobalResources() {
    const resources = this.parentArtboard?.sourceDesign.resources
    if (!resources) return null

    const id = (this._sourceLayer.raw as RawShapeMaskGroupLayer)?.style?.clipPath?.ref
    if (typeof id !== 'string') return null

    return resources.getClipPathById(id)
  }

  private _getMaskResource() {
    return this._getMaskResourceFromLocalResources() || this._getMaskResourceFromGlobalResources()
  }

  private _initFromScrollableGroup() {
    const rawGroup = this._sourceLayer.raw as RawGroupLayer

    const tx = asNumber(rawGroup?.meta?.ux?.offsetX, 0)
    const ty = asNumber(rawGroup?.meta?.ux?.offsetY, 0)
    const width = asNumber(rawGroup?.meta?.ux?.viewportWidth, 1)
    const height = asNumber(rawGroup?.meta?.ux?.viewportHeight, 1)

    const rect = {
      id: `${asString(this._sourceLayer.id)}:mask`,
      name: `${asString(this._sourceLayer.name)} mask`,
      type: 'shape',
      transform: { a: 1, b: 0, c: 0, d: 1, tx, ty },
      meta: { ux: { hasCustomName: true } },
      shape: { type: 'rect', x: 0, y: 0, width, height },
      visible: false,
    } as RawShapeLayer

    const artificialSourceLayer = createSourceLayer({ layer: rect, parent: this._sourceLayer })
    if (!artificialSourceLayer) return null

    return createOctopusLayer({ layer: artificialSourceLayer, parent: this }) as OctopusLayerShape
  }

  private _initFromRepeatGrid() {
    const rawGroup = this._sourceLayer.raw as RawGroupLayer

    const width = asNumber(rawGroup?.meta?.ux?.repeatGrid?.width, 1)
    const height = asNumber(rawGroup?.meta?.ux?.repeatGrid?.height, 1)

    const rect = {
      id: `${asString(this._sourceLayer.id)}:mask`,
      name: `${asString(this._sourceLayer.name)} mask`,
      type: 'shape',
      transform: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
      meta: { ux: { hasCustomName: true } },
      shape: { type: 'rect', x: 0, y: 0, width, height },
      visible: false,
    } as RawShapeLayer

    const artificialSourceLayer = createSourceLayer({ layer: rect, parent: this._sourceLayer })
    if (!artificialSourceLayer) return null

    return createOctopusLayer({ layer: artificialSourceLayer, parent: this }) as OctopusLayerShape
  }

  private _initFromShapeMaskGroup() {
    const mask = this._getMaskResource()

    if (!mask) return null

    /**
     * The only exception when mask layer should stay visible is when it's artboard's background.
     */
    const layer =
      mask === this.parentArtboard?.backgroundMaskLayerRaw
        ? mask
        : {
            ...mask,
            visible: false,
          }

    const sourceLayer = createSourceLayer({
      layer,
      parent: this._sourceLayer,
    })

    if (!sourceLayer) return null
    return createOctopusLayer({ layer: sourceLayer, parent: this }) as OctopusLayerShape | null
  }

  private _initMaskLayer(): OctopusLayerShape | null {
    if (OctopusLayerMaskGroup.isScrollableGroup(this._sourceLayer)) {
      return this._initFromScrollableGroup()
    }

    if (OctopusLayerMaskGroup.isRepeatGrid(this._sourceLayer)) {
      return this._initFromRepeatGrid()
    }

    return this._initFromShapeMaskGroup()
  }

  private _initLayers(): OctopusLayer[] {
    return this._sourceLayer.children.reduce((layers, sourceLayer) => {
      const octopusLayer = createOctopusLayer({
        parent: this,
        layer: sourceLayer,
      })
      return octopusLayer ? push(layers, octopusLayer) : layers
    }, [])
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['MaskGroupLayer']> | null {
    if (!this._mask) return null

    const octopusMask = this._mask.convert()
    if (!octopusMask) return null

    return {
      type: 'MASK_GROUP',
      mask: octopusMask,
      maskBasis: 'BODY',
      layers: this._layers.map((layer) => layer.convert()).filter(Boolean) as Octopus['Layer'][],
    } as const
  }

  convert(): Octopus['MaskGroupLayer'] | null {
    const common = this.convertCommon()
    if (!common) return null

    const specific = this._convertTypeSpecific()
    if (!specific) return null

    return {
      ...common,
      ...specific,
    }
  }
}
