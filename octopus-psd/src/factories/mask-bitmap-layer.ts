import type { OctopusLayerParent } from '../entities/octopus/octopus-layer-base'
import { OctopusLayerShape } from '../entities/octopus/octopus-layer-shape'
import { OctopusLayerShapeLayerAdapter } from '../entities/octopus/octopus-layer-shape-layer-adapter'
import type { SourceLayerLayer } from '../entities/source/source-layer-layer'
import { createSourceLayer, SourceLayer } from './create-source-layer'
import { OctopusLayerMaskGroup } from '../entities/octopus/octopus-layer-mask-group'
import type { RawLayerLayer } from '../typings/raw'
import type { OctopusLayer } from './create-octopus-layer'

type CreateOctopusLayerOptions<T> = {
  sourceLayer: SourceLayer
  octopusLayer: T
  parent: OctopusLayerParent
  bitmapMask: string
}

type RawBitmapMaskLayerOptions = {
  width: number
  height: number
  imageName: string
}

function createRawBitmapMaskLayer({
  width: right,
  height: bottom,
  imageName,
}: RawBitmapMaskLayerOptions): RawLayerLayer {
  return {
    bitmapBounds: { bottom, left: 0, right, top: 0 },
    bounds: { bottom, left: 0, right, top: 0 },
    visible: false,
    imageName,
    type: 'layer',
  }
}

function wrapWithBitmapMaskLayer<T extends OctopusLayer>({
  bitmapMask,
  sourceLayer,
  octopusLayer,
  parent,
}: CreateOctopusLayerOptions<T>): T | OctopusLayerMaskGroup {
  const { width, height } = octopusLayer.parentArtboard.dimensions
  const raw = createRawBitmapMaskLayer({ width, height, imageName: bitmapMask })
  const maskSourceLayer = createSourceLayer({ layer: raw, parent: sourceLayer?.parent }) as SourceLayerLayer
  const maskAdapter = new OctopusLayerShapeLayerAdapter({ parent, sourceLayer: maskSourceLayer })
  // maskAdapter.setFillBlendMode('BRIGHTNESS_TO_ALPHA') // TODO add when https://gitlab.avcd.cz/backend/rendering/-/issues/506 is implemented
  const mask = new OctopusLayerShape({ parent, sourceLayer, adapter: maskAdapter })
  return new OctopusLayerMaskGroup({
    parent,
    id: `${octopusLayer.id}:BitmapMask`,
    mask,
    layers: [octopusLayer],
    maskBasis: 'LAYER',
  })
}

type Options<T> = {
  sourceLayer: SourceLayer
  octopusLayer: T
  parent: OctopusLayerParent
}
export function wrapWithBitmapMaskLayerIfNeeded<T extends OctopusLayer>({
  sourceLayer,
  octopusLayer,
  parent,
}: Options<T>): T | OctopusLayerMaskGroup {
  const bitmapMask = sourceLayer.bitmapMask
  if (!bitmapMask) return octopusLayer
  return wrapWithBitmapMaskLayer({ bitmapMask, sourceLayer, octopusLayer, parent })
}