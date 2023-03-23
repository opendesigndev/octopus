/* eslint-disable @typescript-eslint/no-explicit-any */

import { mkdir, readFile } from 'fs/promises'

import { ArtBoard, ArtBoardRefs, PrivateData } from '@opendesign/illustrator-parser-pdfcpu'
import { FSContext } from '@opendesign/illustrator-parser-pdfcpu/fs_context'
import { describe, expect, it, vi } from 'vitest'

import { AIFileReader } from '../index.js'

vi.mock('@opendesign/illustrator-parser-pdfcpu/fs_context')
vi.mock('@opendesign/illustrator-parser-pdfcpu')
vi.mock('fs/promises')

describe('AIFileReader', () => {
  describe('_getSourceData', () => {
    it('returns source data and sets class properties', async () => {
      AIFileReader.prototype['_resourcesDir'] = 'root/path'

      const ctxMock: any = {
        Bitmaps: { img1: 'image-1.jpg' },
        aiFile: { Version: '1.0.1' },
      }
      const privateDataMock = Promise.resolve({ Textlayers: [], LayerNames: [] })
      vi.mocked(FSContext).mockResolvedValueOnce(ctxMock)
      vi.mocked(ArtBoardRefs).mockReturnValueOnce([{ idx: 1 }, { idx: 2 }] as any)
      vi.mocked(ArtBoard).mockImplementation(async (_, ref) => ({ id: `${ref.idx}` } as any))
      vi.mocked(PrivateData).mockResolvedValueOnce(await privateDataMock)

      const result = await AIFileReader.prototype['_getSourceData']()

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

      const image1Value = Buffer.from('base64;image-1.jpg')
      const image2Value = Buffer.from('base64;image-2.jpg')

      vi.mocked(readFile).mockResolvedValueOnce(image1Value)
      vi.mocked(readFile).mockResolvedValueOnce(image2Value)

      const images = AIFileReader.prototype['_loadImages']()
      expect(await images[0].getImageData()).toEqual(new Uint8Array(image1Value))
      expect(await images[1].getImageData()).toEqual(new Uint8Array(image2Value))
    })

    it('it logs error before throwing', async () => {
      AIFileReader.prototype['_instanceResourcesDir'] = 'root/tempdir'
      AIFileReader.prototype['_images'] = {
        img1: 'image-1.jpg',
        img2: 'image-2.jpg',
      }

      vi.mocked(readFile).mockRejectedValueOnce('could not read image 1')
      vi.mocked(readFile).mockRejectedValueOnce('could not read image 2')

      const images = AIFileReader.prototype['_loadImages']()

      try {
        await images[0].getImageData()
      } catch (err) {
        expect(err).toEqual('could not read image 1')
      }

      try {
        await images[1].getImageData()
      } catch (err) {
        expect(err).toEqual('could not read image 2')
      }
    })
  })

  describe('_createSourceTree', () => {
    it('returns sourceTree', async () => {
      const images: any = [{ id: 'img1.jpg' }]
      AIFileReader.prototype['_loadImages'] = vi.fn().mockReturnValueOnce(images) as any

      const artboards: any = [{ id: 1 }]
      const metadata = { version: 10 }
      const additionalTextData = { Texts: [] }

      AIFileReader.prototype['_getSourceData'] = vi.fn().mockResolvedValueOnce({
        artboards,
        metadata,
        additionalTextData,
      } as any) as any

      expect(await AIFileReader.prototype['_createSourceTree']()).toEqual({
        additionalTextData: { Texts: [] },
        artboards: [{ id: 1 }],
        images: [{ id: 'img1.jpg' }],
        metadata: { version: 10 },
      })
    })

    it('throws when metadata is unavailable', async () => {
      const images: any = [{ id: 'img1.jpg' }]
      AIFileReader.prototype['_loadImages'] = vi.fn().mockReturnValueOnce(images) as any

      const artboards: any = [{ id: 1 }]
      const metadata = undefined
      const additionalTextData = { Texts: [] }

      AIFileReader.prototype['_getSourceData'] = vi.fn().mockResolvedValueOnce({
        artboards,
        metadata,
        additionalTextData,
      } as any) as any

      let error
      try {
        await AIFileReader.prototype['_createSourceTree']()
      } catch (err) {
        error = err
      }
      expect(error).toEqual(Error('Missing metadata from file input'))
    })

    it('throws when artboards have 0 length', async () => {
      const images: any = [{ id: 'img1.jpg' }]
      AIFileReader.prototype['_loadImages'] = vi.fn().mockReturnValueOnce(images) as any

      const artboards: any = []
      const metadata = { version: 10 }
      const additionalTextData = { Texts: [] }

      AIFileReader.prototype['_getSourceData'] = vi.fn().mockResolvedValueOnce({
        artboards,
        metadata,
        additionalTextData,
      } as any) as any

      let error
      try {
        await AIFileReader.prototype['_createSourceTree']()
      } catch (err) {
        error = err
      }

      expect(error).toEqual(Error('Missing artboards from source design'))
    })

    it('throws when artboards have 0 length', async () => {
      const images: any = [{ id: 'img1.jpg' }]
      AIFileReader.prototype['_loadImages'] = vi.fn().mockReturnValueOnce(images) as any

      const artboards: any = []
      const metadata = { version: 10 }
      const additionalTextData = { Texts: [] }

      AIFileReader.prototype['_getSourceData'] = vi.fn().mockResolvedValueOnce({
        artboards,
        metadata,
        additionalTextData,
      } as any) as any

      let error
      try {
        await AIFileReader.prototype['_createSourceTree']()
      } catch (err) {
        error = err
      }

      expect(error).toEqual(Error('Missing artboards from source design'))
    })

    it('throws when additionalTextData are not present', async () => {
      const images: any = [{ id: 'img1.jpg' }]
      AIFileReader.prototype['_loadImages'] = vi.fn().mockReturnValueOnce(images) as any

      const artboards: any = [{ id: 1 }]
      const metadata = { version: 10 }
      const additionalTextData = undefined

      AIFileReader.prototype['_getSourceData'] = vi.fn().mockResolvedValueOnce({
        artboards,
        metadata,
        additionalTextData,
      } as any) as any

      let error
      try {
        await AIFileReader.prototype['_createSourceTree']()
      } catch (err) {
        error = err
      }

      expect(error).toEqual(Error('SourceDesign created without additionalTextData'))
    })
  })
})
