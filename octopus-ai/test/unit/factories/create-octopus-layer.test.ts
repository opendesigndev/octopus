/* eslint-disable @typescript-eslint/no-explicit-any */
import { mocked } from 'jest-mock'

import { OctopusLayerGroup } from '../../../src/entities/octopus/octopus-layer-group'
import { OctopusLayerMaskGroup } from '../../../src/entities/octopus/octopus-layer-mask-group'
import { OctopusLayerShading } from '../../../src/entities/octopus/octopus-layer-shading'
import { OctopusLayerShape } from '../../../src/entities/octopus/octopus-layer-shape'
import { OctopusLayerShapeShapeAdapter } from '../../../src/entities/octopus/octopus-layer-shape-shape-adapter'
import { OctopusLayerShapeXObjectImageAdapter } from '../../../src/entities/octopus/octopus-layer-shape-x-object-image-adapter'
import { OctopusLayerSoftMaskGroup } from '../../../src/entities/octopus/octopus-layer-soft-mask-group'
import { OctopusLayerText } from '../../../src/entities/octopus/octopus-layer-text'
import { createOctopusLayer } from '../../../src/factories/create-octopus-layer'

jest.mock('../../../src/entities/octopus/octopus-layer-soft-mask-group')
jest.mock('../../../src/entities/octopus/octopus-layer-mask-group')
jest.mock('../../../src/entities/octopus/octopus-layer-group')
jest.mock('../../../src/entities/octopus/octopus-layer-shape-shape-adapter')
jest.mock('../../../src/entities/octopus/octopus-layer-shape')
jest.mock('../../../src/entities/octopus/octopus-layer-shading')
jest.mock('../../../src/entities/octopus/octopus-layer-shape-x-object-image-adapter')
jest.mock('../../../src/entities/octopus/octopus-layer-text')
jest.mock('../../../src/entities/octopus/octopus-layer-text')

describe('factories/create-octopus-layer', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('creates OctopusLayerSoftMaskGroup when first sourceLayer has  softMask', () => {
    const parent = {}
    const layerSequences = [{ sourceLayers: [{ softMask: {} }] }, { sourceLayers: [{ mask: {} }] }]
    const instance = {}
    mocked(OctopusLayerSoftMaskGroup).mockReturnValueOnce(instance as any)
    expect(createOctopusLayer({ parent, layerSequences } as any)).toBe(instance)
    expect(OctopusLayerSoftMaskGroup).toHaveBeenCalledWith({ parent, layerSequence: layerSequences[0] })
  })

  it('creates OctopusLayerMaskGroup when first sourceLayer has  mask', () => {
    const parent = {}
    const layerSequences = [{ sourceLayers: [{ mask: {} }] }, { sourceLayers: [{ softMask: {} }] }]
    const instance = {}
    mocked(OctopusLayerMaskGroup).mockReturnValueOnce(instance as any)
    expect(createOctopusLayer({ parent, layerSequences } as any)).toBe(instance)
    expect(OctopusLayerMaskGroup).toHaveBeenCalledWith({ parent, layerSequences })
  })

  it('creates OctopusLayerGroup when first sourceLayer has no mask or softMask and type is MarkedContext ', () => {
    const parent = {}
    const layerSequences = [{ sourceLayers: [{ type: 'MarkedContext' }] }, { sourceLayers: [{}] }]
    const instance = {}
    mocked(OctopusLayerGroup).mockReturnValueOnce(instance as any)
    expect(createOctopusLayer({ parent, layerSequences } as any)).toBe(instance)
    expect(OctopusLayerGroup).toHaveBeenCalledWith({ parent, layerSequence: layerSequences[0] })
  })

  it('creates OctopusLayerGroup when first sourceLayer has no mask or softMask and type is Form ', () => {
    const parent = {}
    const layerSequences = [{ sourceLayers: [{ type: 'Form' }] }, { sourceLayers: [{}] }]
    const instance = {}
    mocked(OctopusLayerGroup).mockReturnValueOnce(instance as any)
    expect(createOctopusLayer({ parent, layerSequences } as any)).toBe(instance)
    expect(OctopusLayerGroup).toHaveBeenCalledWith({ parent, layerSequence: layerSequences[0] })
  })

  it('creates OctopusLayerShape when first sourceLayer has no mask or softMask and type is Path', () => {
    const parent = {}
    const layerSequences = [{ sourceLayers: [{ type: 'Path' }] }, { sourceLayers: [{}] }]
    const instance: any = {}
    const adapter: any = {}
    mocked(OctopusLayerShapeShapeAdapter).mockReturnValueOnce(adapter)
    mocked(OctopusLayerShape).mockReturnValueOnce(instance)

    expect(createOctopusLayer({ parent, layerSequences } as any)).toBe(instance)
    expect(OctopusLayerShapeShapeAdapter).toHaveBeenCalledWith({ parent, layerSequence: layerSequences[0] })
    expect(OctopusLayerShape).toHaveBeenCalledWith({ adapter })
  })

  it('creates OctopusLayerText when first sourceLayer has no mask or softMask and type is TextGroup ', () => {
    const parent = {}
    const layerSequences = [{ sourceLayers: [{ type: 'TextGroup' }] }, { sourceLayers: [{}] }]
    const instance = {}
    mocked(OctopusLayerText).mockReturnValueOnce(instance as any)
    expect(createOctopusLayer({ parent, layerSequences } as any)).toBe(instance)
    expect(OctopusLayerText).toHaveBeenCalledWith({ parent, layerSequence: layerSequences[0] })
  })

  it('creates OctopusLayerShape when first sourceLayer has no mask or softMask and type is Path', () => {
    const parent = {}
    const layerSequences = [{ sourceLayers: [{ type: 'Image' }] }, { sourceLayers: [{}] }]
    const instance: any = {}
    const adapter: any = {}

    mocked(OctopusLayerShapeXObjectImageAdapter).mockReturnValueOnce(adapter)
    mocked(OctopusLayerShape).mockReturnValueOnce(instance)

    expect(createOctopusLayer({ parent, layerSequences } as any)).toBe(instance)
    expect(OctopusLayerShapeXObjectImageAdapter).toHaveBeenCalledWith({ parent, layerSequence: layerSequences[0] })
    expect(OctopusLayerShape).toHaveBeenCalledWith({ adapter })
  })

  it('creates OctopusLayerShading when first sourceLayer has no mask or softMask and type is Shading ', () => {
    const parent = {}
    const layerSequences = [{ sourceLayers: [{ type: 'Shading' }] }, { sourceLayers: [{}] }]
    const instance = {}
    mocked(OctopusLayerShading).mockReturnValueOnce(instance as any)
    expect(createOctopusLayer({ parent, layerSequences } as any)).toBe(instance)
    expect(OctopusLayerShading).toHaveBeenCalledWith({ parent, layerSequence: layerSequences[0] })
  })
})
