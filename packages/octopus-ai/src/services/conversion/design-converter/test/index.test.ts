/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, expect, it, vi, afterEach } from 'vitest'

import { OctopusManifest } from '../../../../entities/octopus/octopus-manifest.js'
import { ArtboardConverter } from '../../artboard-converter/index.js'
import { DesignConverter } from '../index.js'

vi.mock('../../artboard-converter')
vi.mock('../../../../entities/octopus/octopus-manifest')

function getDesignConverterTestInstance({
  sourceDesignOption,
  octopusAIConverterOption,
  exporter,
  partialUpdateInterval,
}: {
  sourceDesignOption?: any
  octopusAIConverterOption?: any
  exporter?: any
  partialUpdateInterval?: number
}) {
  const sourceDesign: any = sourceDesignOption ?? { additionalTextData: {} }
  const octopusAIconverter: any = octopusAIConverterOption ?? {}

  return new DesignConverter({ sourceDesign, octopusAIconverter, exporter, partialUpdateInterval })
}

const manifestInstanceMock: any = {
  setExportedImage: vi.fn(),
  convert: vi.fn(),
  setExportedArtboard: vi.fn(),
  registerBasePath: vi.fn(),
}
vi.mocked(OctopusManifest).mockReturnValue(manifestInstanceMock)

describe('DesignConverter', () => {
  describe('_convertArtboardByIdSafe', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })
    it('returns value with no error when ArtboardConverter returns', () => {
      const testInstance = getDesignConverterTestInstance({})
      vi.mocked(ArtboardConverter).mockReturnValueOnce({ convert: () => ({ id: '1' }) } as any)
      const artboardId = '1'
      const result = testInstance['_convertArtboardByIdSafe']('1')

      expect(result).toEqual({ error: null, value: { id: '1' } })
      expect(ArtboardConverter).toHaveBeenCalledWith({ targetArtboardId: artboardId, designConverter: testInstance })
    })

    it('returns error and value as null when ArtboardConverter throws', async () => {
      const testInstance = getDesignConverterTestInstance({})

      const error = new Error('MockThrow')
      const convert: any = () => {
        throw error
      }

      vi.mocked(ArtboardConverter).mockReturnValueOnce({
        convert,
      } as any)

      const artboardId = '1'
      const result = await testInstance['_convertArtboardByIdSafe']('1')

      expect(result).toEqual({ value: null, error })
      expect(ArtboardConverter).toHaveBeenCalledWith({ targetArtboardId: artboardId, designConverter: testInstance })
    })
  })

  describe('convertArtboardById', () => {
    it('returns result from benchmark', () => {
      const testInstance = getDesignConverterTestInstance({})
      const _convertArtboardByIdSafeMock = vi.fn().mockReturnValueOnce({ value: { id: '1' }, error: null })
      testInstance['_convertArtboardByIdSafe'] = _convertArtboardByIdSafeMock

      expect(testInstance.convertArtboardById('1')).toEqual({
        error: null,
        id: '1',
        time: expect.any(Number),
        value: { id: '1' },
      })
    })
  })

  describe('_exportArtboard', () => {
    it('exports,returns and sets to manifest artboard and images', async () => {
      const manifestInstanceMock: any = {
        setExportedImage: vi.fn(),
        convert: vi.fn(),
        setExportedArtboard: vi.fn(),
        registerBasePath: vi.fn(),
      }
      vi.mocked(OctopusManifest).mockReturnValueOnce(manifestInstanceMock)

      const sourceDesign = {
        images: [
          { path: 'path/image-1.jpg', getImageData: async () => 'base64;image-1' },
          { path: 'path/image-2.jpg', getImageData: async () => 'base64;image-2' },
          { path: 'path/image-3.jpg', getImageData: async () => 'base64;image-3' },
        ],
      }
      const testInstance = getDesignConverterTestInstance({ sourceDesignOption: sourceDesign })
      testInstance.convertArtboardById = vi
        .fn()
        .mockReturnValueOnce({ id: 1, value: { id: '1' }, error: null, time: 5 })
      const exporter: any = {
        exportImage: vi.fn().mockImplementation(async (imagePath) => 'root/' + imagePath),
        exportArtboard: vi.fn().mockImplementation(async (artboard) => 'root/' + artboard.value.id),
      }
      const artboard: any = {
        id: '1',
        value: { id: '1' },
        dependencies: {
          images: ['path/image-1.jpg', 'path/image-3.jpg'],
        },
      }

      const result = await testInstance['_exportArtboard'](exporter, artboard)

      expect(result).toEqual({
        artboard: { error: null, id: 1, time: 5, value: { id: '1' } },
        images: [sourceDesign.images[0], sourceDesign.images[2]],
      })

      expect(exporter.exportImage).toHaveBeenCalledWith('path/image-1.jpg', 'base64;image-1')
      expect(exporter.exportImage).toHaveBeenCalledWith('path/image-3.jpg', 'base64;image-3')

      expect(manifestInstanceMock.setExportedImage).toHaveBeenCalledWith('image-1.jpg', 'root/path/image-1.jpg')
      expect(manifestInstanceMock.setExportedImage).toHaveBeenCalledWith('image-3.jpg', 'root/path/image-3.jpg')

      expect(exporter.exportArtboard).toHaveBeenCalledWith(
        { dependencies: { images: ['path/image-1.jpg', 'path/image-3.jpg'] }, id: '1', value: { id: '1' } },
        { error: null, id: 1, time: 5, value: { id: '1' } }
      )
      expect(manifestInstanceMock.setExportedArtboard).toHaveBeenCalledWith('1', 'root/1')
    })
  })

  describe('convert', () => {
    it('returns manifest, artboard  and images', async () => {
      const manifestInstanceMock: any = {
        setExportedImage: vi.fn(),
        convert: vi.fn(),
        setExportedArtboard: vi.fn(),
        registerBasePath: vi.fn(),
      }
      vi.mocked(OctopusManifest).mockReturnValueOnce(manifestInstanceMock)

      const sourceDesign = {
        artboards: [
          { id: 1, images: [{ path: 'path/img1.jpg' }] },
          { id: 2, images: [] },
        ],
      }

      const exporter: any = {
        exportAuxiliaryData: vi.fn(),
        finalizeExport: vi.fn(),
      }

      const testInstance = getDesignConverterTestInstance({
        sourceDesignOption: sourceDesign,
        exporter,
        partialUpdateInterval: 3000,
      })
      const queueMock = {
        exec: async (val: any) => ({
          images: val.images,
          artboard: val,
        }),
      }
      testInstance['_initArtboardQueue'] = vi.fn().mockReturnValueOnce(queueMock)
      testInstance['_exportManifest'] = vi.fn().mockReturnValue(manifestInstanceMock)

      const value = await testInstance.convert()

      expect(value).toEqual({
        artboards: [
          { id: 1, images: [{ path: 'path/img1.jpg' }] },
          { id: 2, images: [] },
        ],
        images: [{ path: 'path/img1.jpg' }],
        manifest: manifestInstanceMock,
      })

      expect(exporter.finalizeExport).toHaveBeenCalled()
    })
  })
})
