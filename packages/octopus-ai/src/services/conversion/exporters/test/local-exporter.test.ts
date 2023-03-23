/* eslint-disable @typescript-eslint/no-explicit-any */

import { promises as fsp } from 'fs'
import os from 'os'
import path from 'path'

import { v4 as uuidv4 } from 'uuid'
import { describe, expect, it, vi, afterEach } from 'vitest'

import { LocalExporter } from '../local-exporter.js'

vi.mock('os')
// vi.mock('uuid')

vi.mock('fs', () => {
  const promises = {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
  }

  return { promises }
})

vi.mock('uuid', () => ({
  v4: vi.fn(),
}))

vi.mock('os', () => ({
  tmpdir: vi.fn(),
}))

vi.mocked(os.tmpdir).mockReturnValue('tmpdir')
vi.mocked(uuidv4).mockReturnValue('randomdirname')

describe('LocalExporter', () => {
  describe('_outputDir', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    it('sets up outputDir', async () => {
      const mockPath = 'some/path'
      const instance = new LocalExporter({ path: mockPath })
      expect(await instance['_outputDir']).toEqual(mockPath)
      expect(fsp.mkdir).toHaveBeenCalledWith(path.join(mockPath, LocalExporter.IMAGES_DIR_NAME), {
        recursive: true,
      })
    })

    it('creates path for tempDir when not provided', async () => {
      const instance = new LocalExporter({})
      expect(await instance['_outputDir']).toEqual('tmpdir/octopusAI/randomdirname')
      expect(fsp.mkdir).toHaveBeenCalledWith(
        path.join('tmpdir/octopusAI/randomdirname', LocalExporter.IMAGES_DIR_NAME),
        {
          recursive: true,
        }
      )
    })
  })

  describe('_save', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    it('saves to file and pushes to _assetsSaves and resolves', async () => {
      const instance = new LocalExporter({})
      vi.mocked(fsp.writeFile).mockReturnValueOnce(Promise.resolve())

      const assetPath = await instance['_save']('someImage.jpg', 'base64')

      expect(instance['_assetsSaves']).toEqual([Promise.resolve()])
      expect(fsp.writeFile).toHaveBeenCalledWith('tmpdir/octopusAI/randomdirname/someImage.jpg', 'base64')
      expect(assetPath).toEqual('tmpdir/octopusAI/randomdirname/someImage.jpg')
    })

    it('saves to path provided in constructor', async () => {
      const instance = new LocalExporter({ path: 'some/path' })
      vi.mocked(fsp.writeFile).mockReturnValueOnce(Promise.resolve())

      const assetPath = await instance['_save']('someImage.jpg', 'base64')

      expect(instance['_assetsSaves']).toEqual([Promise.resolve()])
      expect(fsp.writeFile).toHaveBeenCalledWith('some/path/someImage.jpg', 'base64')
      expect(assetPath).toEqual('some/path/someImage.jpg')
    })
  })

  describe('exportAuxiliaryData', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    const design: any = {
      metaData: { version: 'ai-3' },
      additionalTextData: { Texts: [{ content: 'hello' }] },
    }

    it('saves images and metadata', async () => {
      const instance = new LocalExporter({})
      const result = await instance.exportAuxiliaryData(design)

      expect(result).toEqual({
        additionalTextData: 'tmpdir/octopusAI/randomdirname/additional-text-data.json',
        metadata: 'tmpdir/octopusAI/randomdirname/metadata.json',
      })
    })

    it('saves  metadata and returns null for additionalTextData path when its undefined', async () => {
      const instance = new LocalExporter({})
      const result = await instance.exportAuxiliaryData({ ...design, additionalTextData: null })

      expect(result).toEqual({
        additionalTextData: null,
        metadata: 'tmpdir/octopusAI/randomdirname/metadata.json',
      })
    })
  })

  describe('exportArtboard', () => {
    it('exports artboard', async () => {
      const instance = new LocalExporter({})
      const artboard: any = { value: { id: '1' } }

      expect(await instance.exportArtboard({} as any, artboard)).toEqual(
        'tmpdir/octopusAI/randomdirname/octopus-1.json'
      )
    })

    it('resolves to null when arbtoard has no value', async () => {
      const instance = new LocalExporter({})
      const artboard: any = {}

      expect(await instance.exportArtboard({} as any, artboard)).toEqual(null)
    })
  })
})
