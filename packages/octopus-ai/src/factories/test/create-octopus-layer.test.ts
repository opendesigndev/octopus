/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, describe, expect, it, vi } from 'vitest'

import { OctopusLayerGroup } from '../../entities/octopus/octopus-layer-group.js'
import { OctopusLayerMaskGroup } from '../../entities/octopus/octopus-layer-mask-group.js'
import { OctopusLayerShading } from '../../entities/octopus/octopus-layer-shading.js'
import { OctopusLayerShapeShapeAdapter } from '../../entities/octopus/octopus-layer-shape-shape-adapter.js'
import { OctopusLayerShapeXObjectImageAdapter } from '../../entities/octopus/octopus-layer-shape-x-object-image-adapter.js'
import { OctopusLayerShape } from '../../entities/octopus/octopus-layer-shape.js'
import { OctopusLayerSoftMaskGroup } from '../../entities/octopus/octopus-layer-soft-mask-group.js'
import { OctopusLayerText } from '../../entities/octopus/octopus-layer-text.js'
import { createOctopusLayer } from '../create-octopus-layer.js'

vi.mock('../../entities/octopus/octopus-layer-soft-mask-group')
vi.mock('../../entities/octopus/octopus-layer-mask-group')
vi.mock('../../entities/octopus/octopus-layer-group')
vi.mock('../../entities/octopus/octopus-layer-shape-shape-adapter')
vi.mock('../../entities/octopus/octopus-layer-shape')
vi.mock('../../entities/octopus/octopus-layer-shading')
vi.mock('../../entities/octopus/octopus-layer-shape-x-object-image-adapter')
vi.mock('../../entities/octopus/octopus-layer-text')
vi.mock('../../entities/octopus/octopus-layer-text')

describe('createOctopusLayer', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('creates OctopusLayerSoftMaskGroup when first sourceLayer has  softMask', () => {
    const parent = {}
    const layerSequences = [{ sourceLayers: [{ softMask: {} }] }, { sourceLayers: [{ mask: {} }] }]
    const instance = {}
    vi.mocked(OctopusLayerSoftMaskGroup).mockReturnValueOnce(instance as any)
    expect(createOctopusLayer({ parent, layerSequences } as any)).toBe(instance)
    expect(OctopusLayerSoftMaskGroup).toHaveBeenCalledWith({ parent, layerSequence: layerSequences[0] })
  })

  it('creates OctopusLayerMaskGroup when first sourceLayer has mask', () => {
    const parent = {}
    const layerSequences = [{ sourceLayers: [{ mask: {} }] }, { sourceLayers: [{ softMask: {} }] }]
    const instance = {}
    vi.mocked(OctopusLayerMaskGroup).mockReturnValueOnce(instance as any)
    expect(createOctopusLayer({ parent, layerSequences } as any)).toBe(instance)
    expect(OctopusLayerMaskGroup).toHaveBeenCalledWith({ parent, layerSequences })
  })

  it('creates OctopusLayerGroup when first sourceLayer has no mask or softMask and type is MarkedContext ', () => {
    const parent = {}
    const layerSequences = [{ sourceLayers: [{ type: 'MarkedContext' }] }, { sourceLayers: [{}] }]
    const instance = {}
    vi.mocked(OctopusLayerGroup).mockReturnValueOnce(instance as any)
    expect(createOctopusLayer({ parent, layerSequences } as any)).toBe(instance)
    expect(OctopusLayerGroup).toHaveBeenCalledWith({ parent, layerSequence: layerSequences[0] })
  })

  it('creates OctopusLayerGroup when first sourceLayer has no mask or softMask and type is Form ', () => {
    const parent = {}
    const layerSequences = [{ sourceLayers: [{ type: 'Form' }] }, { sourceLayers: [{}] }]
    const instance = {}
    vi.mocked(OctopusLayerGroup).mockReturnValueOnce(instance as any)
    expect(createOctopusLayer({ parent, layerSequences } as any)).toBe(instance)
    expect(OctopusLayerGroup).toHaveBeenCalledWith({ parent, layerSequence: layerSequences[0] })
  })

  it('creates OctopusLayerShape when first sourceLayer has no mask or softMask and type is Path', () => {
    const parent = {}
    const layerSequences = [{ sourceLayers: [{ type: 'Path' }] }, { sourceLayers: [{}] }]
    const instance: any = {}
    const adapter: any = {}
    vi.mocked(OctopusLayerShapeShapeAdapter).mockReturnValueOnce(adapter)
    vi.mocked(OctopusLayerShape).mockReturnValueOnce(instance)

    expect(createOctopusLayer({ parent, layerSequences } as any)).toBe(instance)
    expect(OctopusLayerShapeShapeAdapter).toHaveBeenCalledWith({ parent, layerSequence: layerSequences[0] })
    expect(OctopusLayerShape).toHaveBeenCalledWith({ adapter })
  })

  it('creates OctopusLayerText when first sourceLayer has no mask or softMask and type is TextGroup ', () => {
    const parent = {}
    const layerSequences = [{ sourceLayers: [{ type: 'TextGroup' }] }, { sourceLayers: [{}] }]
    const instance = {}
    vi.mocked(OctopusLayerText).mockReturnValueOnce(instance as any)
    expect(createOctopusLayer({ parent, layerSequences } as any)).toBe(instance)
    expect(OctopusLayerText).toHaveBeenCalledWith({ parent, layerSequence: layerSequences[0] })
  })

  it('creates OctopusLayerShape when first sourceLayer has no mask or softMask and type is Path', () => {
    const parent = {}
    const layerSequences = [{ sourceLayers: [{ type: 'Image' }] }, { sourceLayers: [{}] }]
    const instance: any = {}
    const adapter: any = {}

    vi.mocked(OctopusLayerShapeXObjectImageAdapter).mockReturnValueOnce(adapter)
    vi.mocked(OctopusLayerShape).mockReturnValueOnce(instance)

    expect(createOctopusLayer({ parent, layerSequences } as any)).toBe(instance)
    expect(OctopusLayerShapeXObjectImageAdapter).toHaveBeenCalledWith({ parent, layerSequence: layerSequences[0] })
    expect(OctopusLayerShape).toHaveBeenCalledWith({ adapter })
  })

  it('creates OctopusLayerShading when first sourceLayer has no mask or softMask and type is Shading ', () => {
    const parent = {}
    const layerSequences = [{ sourceLayers: [{ type: 'Shading' }] }, { sourceLayers: [{}] }]
    const instance = {}
    vi.mocked(OctopusLayerShading).mockReturnValueOnce(instance as any)
    expect(createOctopusLayer({ parent, layerSequences } as any)).toBe(instance)
    expect(OctopusLayerShading).toHaveBeenCalledWith({ parent, layerSequence: layerSequences[0] })
  })
})
