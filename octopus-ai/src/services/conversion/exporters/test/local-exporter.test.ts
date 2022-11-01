/* eslint-disable @typescript-eslint/no-explicit-any */

import fs from 'fs'
import os from 'os'
import path from 'path'

import { mocked } from 'jest-mock'
import { v4 as uuidv4 } from 'uuid'

import { LocalExporter } from '../local-exporter'

jest.mock('os')
jest.mock('uuid')

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
  },
}))

mocked(os.tmpdir).mockReturnValue('tmpdir')
mocked(uuidv4).mockReturnValue('randomdirname')

describe('LocalExporter', () => {
  describe('_outputDir', () => {
    afterEach(jest.clearAllMocks)

    it('sets up outputDir', async () => {
      const mockPath = 'some/path'
      const instance = new LocalExporter({ path: mockPath })
      expect(await instance['_outputDir']).toEqual(mockPath)
      expect(fs.promises.mkdir).toHaveBeenCalledWith(path.join(mockPath, LocalExporter.IMAGES_DIR_NAME), {
        recursive: true,
      })
    })

    it('creates path for tempDir when not provided', async () => {
      const instance = new LocalExporter({})
      expect(await instance['_outputDir']).toEqual('tmpdir/randomdirname')
      expect(fs.promises.mkdir).toHaveBeenCalledWith(
        path.join('tmpdir/randomdirname/', LocalExporter.IMAGES_DIR_NAME),
        {
          recursive: true,
        }
      )
    })
  })

  describe('_save', () => {
    afterEach(jest.clearAllMocks)

    it('saves to file and pushes to _assetsSaves and resolves', async () => {
      const instance = new LocalExporter({})
      mocked(fs.promises.writeFile).mockReturnValueOnce(Promise.resolve())

      const assetPath = await instance['_save']('someImage.jpg', 'base64')

      expect(instance['_assetsSaves']).toEqual([Promise.resolve()])
      expect(fs.promises.writeFile).toHaveBeenCalledWith('tmpdir/randomdirname/someImage.jpg', 'base64')
      expect(assetPath).toEqual('tmpdir/randomdirname/someImage.jpg')
    })

    it('saves to path provided in constructor', async () => {
      const instance = new LocalExporter({ path: 'some/path' })
      mocked(fs.promises.writeFile).mockReturnValueOnce(Promise.resolve())

      const assetPath = await instance['_save']('someImage.jpg', 'base64')

      expect(instance['_assetsSaves']).toEqual([Promise.resolve()])
      expect(fs.promises.writeFile).toHaveBeenCalledWith('some/path/someImage.jpg', 'base64')
      expect(assetPath).toEqual('some/path/someImage.jpg')
    })
  })

  describe('exportAuxiliaryData', () => {
    afterEach(jest.clearAllMocks)

    const design: any = {
      metaData: { version: 'ai-3' },
      additionalTextData: { Texts: [{ content: 'hello' }] },
    }

    it('saves images and metadata', async () => {
      const instance = new LocalExporter({})
      const result = await instance.exportAuxiliaryData(design)

      expect(result).toEqual({
        additionalTextData: 'tmpdir/randomdirname/additional-text-data.json',
        metadata: 'tmpdir/randomdirname/metadata.json',
      })
    })

    it('saves  metadata and returns null for additionalTextData path when its undefined', async () => {
      const instance = new LocalExporter({})
      const result = await instance.exportAuxiliaryData({ ...design, additionalTextData: null })

      expect(result).toEqual({
        additionalTextData: null,
        metadata: 'tmpdir/randomdirname/metadata.json',
      })
    })
  })

  describe('exportArtboard', () => {
    it('exports artboard', async () => {
      const instance = new LocalExporter({})
      const artboard: any = { value: { id: '1' } }

      expect(await instance.exportArtboard({} as any, artboard)).toEqual('tmpdir/randomdirname/octopus-1.json')
    })

    it('resolves to null when arbtoard has no value', async () => {
      const instance = new LocalExporter({})
      const artboard: any = {}

      expect(await instance.exportArtboard({} as any, artboard)).toEqual(null)
    })
  })
})
