/* eslint-disable @typescript-eslint/no-explicit-any */

import { mkdir, readFile } from 'fs/promises'

import { jest } from '@jest/globals'
import { FSContext } from '@opendesign/illustrator-parser-pdfcpu/dist/fs_context'
import { ArtBoard, ArtBoardRefs, PrivateData } from '@opendesign/illustrator-parser-pdfcpu/dist/index'
import { mocked } from 'jest-mock'

import { AIFileReader } from '..'
import { logger } from '../../../instances/logger'

jest.mock('@opendesign/illustrator-parser-pdfcpu/dist/fs_context')
jest.mock('@opendesign/illustrator-parser-pdfcpu/dist/index')
jest.mock('fs/promises')
jest.mock('../../../instances/logger')

describe('AIFileReader', () => {
  describe('_getSourceData', () => {
    afterEach(() => jest.resetAllMocks())
    it('returns source data and sets class properties', async () => {
      AIFileReader.prototype['_resourcesDir'] = 'root/path'

      const ctxMock: any = {
        Bitmaps: { img1: 'image-1.jpg' },
        aiFile: { Version: '1.0.1' },
      }
      const privateDataMock = Promise.resolve({ Textlayers: [], LayerNames: [] })
      mocked(FSContext).mockResolvedValueOnce(ctxMock)
      mocked(ArtBoardRefs).mockReturnValueOnce([{ idx: 1 }, { idx: 2 }] as any)
      mocked(ArtBoard).mockImplementation(async (_, ref) => ({ id: `${ref.idx}` } as any))
      mocked(PrivateData).mockResolvedValueOnce(privateDataMock)

      const result = await AIFileReader.prototype['_getSourceData']('root/path')

      expect(mkdir).toHaveBeenCalledWith('root/path', { recursive: true })
      expect(result).toEqual({
        additionalTextData: { LayerNames: [], Textlayers: [] },
        artboards: [{ id: '1' }, { id: '2' }],
        metadata: { version: '1.0.1' },
      })
      expect(AIFileReader.prototype['_images']).toEqual(ctxMock.Bitmaps)
      expect(ArtBoardRefs).toHaveBeenCalledWith(ctxMock)
      expect(ArtBoard).toHaveBeenNthCalledWith(1, ctxMock, { idx: 1 })
      expect(ArtBoard).toHaveBeenNthCalledWith(2, ctxMock, { idx: 2 })
    })
  })

  describe('_loadImages', () => {
    it('creates objects with image properties and get getImageData', () => {
      AIFileReader.prototype['_instanceResourcesDir'] = 'root/tempdir'
      AIFileReader.prototype['_images'] = {
        img1: 'image-1.jpg',
        img2: 'image-2.jpg',
      }

      expect(AIFileReader.prototype['_loadImages']()).toEqual([
        {
          getImageData: expect.any(Function),
          id: 'image-1.jpg',
          path: 'root/tempdir/bitmaps/image-1.jpg',
        },
        {
          getImageData: expect.any(Function),
          id: 'image-2.jpg',
          path: 'root/tempdir/bitmaps/image-2.jpg',
        },
      ])
    })

    it('returns value from  getImageData when it gets called', async () => {
      AIFileReader.prototype['_instanceResourcesDir'] = 'root/tempdir'
      AIFileReader.prototype['_images'] = {
        img1: 'image-1.jpg',
        img2: 'image-2.jpg',
      }

      const image1Value = 'base64;image-1.jpg'
      const image2Value = 'base64;image-2.jpg'

      mocked(readFile).mockResolvedValueOnce(image1Value)
      mocked(readFile).mockResolvedValueOnce(image2Value)

      const images = AIFileReader.prototype['_loadImages']()

      expect(await images[0].getImageData()).toEqual(image1Value)
      expect(await images[1].getImageData()).toEqual(image2Value)
    })

    it('it logs error before throwing', async () => {
      AIFileReader.prototype['_instanceResourcesDir'] = 'root/tempdir'
      AIFileReader.prototype['_images'] = {
        img1: 'image-1.jpg',
        img2: 'image-2.jpg',
      }

      mocked(readFile).mockRejectedValueOnce('could not read image 1')
      mocked(readFile).mockRejectedValueOnce('could not read image 2')

      const images = AIFileReader.prototype['_loadImages']()

      try {
        await images[0].getImageData()
      } catch (err) {
        expect(logger.error).toHaveBeenCalledWith('Failed to read image', 'root/tempdir/bitmaps/image-1.jpg')
        expect(err).toEqual('could not read image 1')
      }

      try {
        await images[1].getImageData()
      } catch (err) {
        expect(logger.error).toHaveBeenCalledWith('Failed to read image', 'root/tempdir/bitmaps/image-2.jpg')
        expect(err).toEqual('could not read image 2')
      }
    })
  })

  describe('_createSourceTree', () => {
    it('returns sourceTree', async () => {
      const images: any = [{ id: 'img1.jpg' }]
      AIFileReader.prototype['_loadImages'] = jest.fn().mockReturnValueOnce(images) as any

      const artboards: any = [{ id: 1 }]
      const metadata = { version: 10 }
      const additionalTextData = { Texts: [] }

      AIFileReader.prototype['_getSourceData'] = (jest.fn() as any).mockResolvedValueOnce({
        artboards,
        metadata,
        additionalTextData,
      } as any) as any

      expect(await AIFileReader.prototype['_createSourceTree']('root/path')).toEqual({
        additionalTextData: { Texts: [] },
        artboards: [{ id: 1 }],
        images: [{ id: 'img1.jpg' }],
        metadata: { version: 10 },
      })

      expect(AIFileReader.prototype['_getSourceData']).toHaveBeenCalledWith('root/path')
    })

    it('throws when metadata is unavailable', async () => {
      const images: any = [{ id: 'img1.jpg' }]
      AIFileReader.prototype['_loadImages'] = jest.fn().mockReturnValueOnce(images) as any

      const artboards: any = [{ id: 1 }]
      const metadata = undefined
      const additionalTextData = { Texts: [] }

      AIFileReader.prototype['_getSourceData'] = (jest.fn() as any).mockResolvedValueOnce({
        artboards,
        metadata,
        additionalTextData,
      } as any) as any

      let error
      try {
        await AIFileReader.prototype['_createSourceTree']('root/path')
      } catch (err) {
        error = err
      }
      expect(error).toEqual(Error('Missing metadata from file input'))
    })

    it('throws when artboards have 0 length', async () => {
      const images: any = [{ id: 'img1.jpg' }]
      AIFileReader.prototype['_loadImages'] = jest.fn().mockReturnValueOnce(images) as any

      const artboards: any = []
      const metadata = { version: 10 }
      const additionalTextData = { Texts: [] }

      AIFileReader.prototype['_getSourceData'] = (jest.fn() as any).mockResolvedValueOnce({
        artboards,
        metadata,
        additionalTextData,
      } as any) as any

      let error
      try {
        await AIFileReader.prototype['_createSourceTree']('root/path')
      } catch (err) {
        error = err
      }

      expect(error).toEqual(Error('Missing artboards from source design'))
    })

    it('throws when artboards have 0 length', async () => {
      const images: any = [{ id: 'img1.jpg' }]
      AIFileReader.prototype['_loadImages'] = jest.fn().mockReturnValueOnce(images) as any

      const artboards: any = []
      const metadata = { version: 10 }
      const additionalTextData = { Texts: [] }

      AIFileReader.prototype['_getSourceData'] = (jest.fn() as any).mockResolvedValueOnce({
        artboards,
        metadata,
        additionalTextData,
      } as any) as any

      let error
      try {
        await AIFileReader.prototype['_createSourceTree']('root/path')
      } catch (err) {
        error = err
      }

      expect(error).toEqual(Error('Missing artboards from source design'))
    })

    it('throws when additionalTextData are not present', async () => {
      const images: any = [{ id: 'img1.jpg' }]
      AIFileReader.prototype['_loadImages'] = jest.fn().mockReturnValueOnce(images) as any

      const artboards: any = [{ id: 1 }]
      const metadata = { version: 10 }
      const additionalTextData = undefined

      AIFileReader.prototype['_getSourceData'] = (jest.fn() as any).mockResolvedValueOnce({
        artboards,
        metadata,
        additionalTextData,
      } as any) as any

      let error
      try {
        await AIFileReader.prototype['_createSourceTree']('root/path')
      } catch (err) {
        error = err
      }

      expect(error).toEqual(Error('SourceDesign created without additionalTextData'))
    })
  })
})
