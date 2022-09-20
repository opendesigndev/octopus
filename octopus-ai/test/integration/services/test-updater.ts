import fsp from 'fs/promises'
import path from 'path'

import { OctopusAIConverter } from '../../../src'
import { TempExporter } from '../../../src/services/conversion/design-converter'
import { createOctopusArtboardFileName } from '../../../src/utils/exporter'
import { getSourceDesign } from '../utils'
import { AssetsReader } from './assets-reader'

import type { Manifest } from '../../../src/typings/manifest'
import type { Octopus } from '../../../src/typings/octopus'
import type { TestDirectoryData } from './assets-reader'

interface TestUpdaterAssetsReader {
  getTestsDirectoryData: () => Promise<TestDirectoryData[]>
}

type TestAssets = {
  artboards: Octopus['OctopusDocument'][]
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
    this._octopusAIConverter = new OctopusAIConverter({})
  }

  private async _getTestsAssets(): Promise<TestAssets[]> {
    const testsDirectoryData = await this._assetsReader.getTestsDirectoryData()
    return Promise.all(
      testsDirectoryData.map(async ({ designPath, expectedDirPath, testName, testPath }) => {
        const sourceDesign = await getSourceDesign(designPath)

        const { artboards: artboardConversionResults, manifest } = await this._octopusAIConverter.convertDesign({
          sourceDesign,
        })

        return {
          artboards: artboardConversionResults
            .map((artboardConversionResult) => artboardConversionResult.value)
            .filter((artboard): artboard is Octopus['OctopusDocument'] => Boolean(artboard)),
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
