import fsp from 'fs/promises'
import path from 'path'

import { AssetsReader } from './assets-reader.js'
import { createConverter } from '../../../src/index-node.js'
import { TempExporter } from '../../../src/services/conversion/exporters/temp-exporter.js'
import { AIFileReader } from '../../../src/services/readers/node/index.js'
import { createOctopusArtboardFileName } from '../../../src/utils/exporter.js'
import { getSourceDesign } from '../utils.js'

import type { TestDirectoryData } from './assets-reader.js'
import type { OctopusAIConverter } from '../../../src/octopus-ai-converter.js'
import type { Manifest } from '../../../src/typings/manifest/index.js'
import type { Octopus } from '../../../src/typings/octopus/index.js'

interface TestUpdaterAssetsReader {
  getTestsDirectoryData: () => Promise<TestDirectoryData[]>
}

type TestAssets = {
  artboards: Octopus['OctopusComponent'][]
  manifest: Manifest['OctopusManifest']
  expectedDirPath: string | null
  testName: string
  testPath: string
}

export class TestUpdater {
  private _assetsReader: TestUpdaterAssetsReader
  private _octopusAIConverter: OctopusAIConverter

  constructor(assetsReader: TestUpdaterAssetsReader) {
    this._assetsReader = assetsReader
    this._octopusAIConverter = createConverter()
  }

  private async _getTestsAssets(): Promise<TestAssets[]> {
    const testsDirectoryData = await this._assetsReader.getTestsDirectoryData()
    return Promise.all(
      testsDirectoryData.map(async ({ designPath, expectedDirPath, testName, testPath }) => {
        const fileReader = new AIFileReader({ path: designPath })

        const sourceDesign = await getSourceDesign(fileReader)

        const { artboards: artboardConversionResults, manifest } = await this._octopusAIConverter.convertDesign({
          sourceDesign,
        })

        await fileReader.cleanup()

        return {
          artboards: artboardConversionResults
            .map((artboardConversionResult) => artboardConversionResult.value)
            .filter((artboard): artboard is Octopus['OctopusComponent'] => Boolean(artboard)),
          manifest: manifest,
          expectedDirPath,
          testName,
          testPath,
        }
      })
    )
  }

  private _cleanupExpectedDirs(testsAssets: TestAssets[]): Promise<(TestAssets & { expectedDirPath: string })[]> {
    return Promise.all(
      testsAssets.map(async (testAssets) => {
        const { expectedDirPath } = testAssets
        if (expectedDirPath) {
          await fsp.rm(expectedDirPath, { recursive: true, force: true })
        }

        const createdExpectedDirPath = path.join(testAssets.testPath, AssetsReader.EXPECTED_DIR_NAME)

        await fsp.mkdir(createdExpectedDirPath)

        return { ...testAssets, expectedDirPath: createdExpectedDirPath }
      })
    )
  }

  private _saveAssets(testAssets: (TestAssets & { expectedDirPath: string })[]): Promise<void[][]> {
    return Promise.all(
      testAssets.map(async ({ artboards, manifest, expectedDirPath }) => {
        const manifestPath = path.join(expectedDirPath, TempExporter.OCTOPUS_MANIFEST_NAME)
        await fsp.writeFile(manifestPath, JSON.stringify(manifest, null, 2))

        return Promise.all(
          artboards.map((artboard) => {
            const artboardPath = path.join(expectedDirPath, createOctopusArtboardFileName(artboard.id))
            return fsp.writeFile(artboardPath, JSON.stringify(artboard, null, 2))
          })
        )
      })
    )
  }

  async update(): Promise<void> {
    const testsAssets = await this._getTestsAssets()
    const testAssetsWithCleanExpectedDirs = await this._cleanupExpectedDirs(testsAssets)
    this._saveAssets(testAssetsWithCleanExpectedDirs)
  }
}
