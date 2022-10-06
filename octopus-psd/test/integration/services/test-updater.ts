import path from 'path'

import { OctopusPSDConverter } from '../../../src'
import { MANIFEST_NAME, getOctopusFileName } from '../../../src/utils/exporter'
import { saveFile, rmDir, makeDir } from '../../../src/utils/files'
import { getSourceDesign } from '../utils/source'
import { stringify } from '../utils/stringify'
import { AssetReader } from './asset-reader'

import type { Manifest } from '../../../src/typings/manifest'
import type { Octopus } from '../../../src/typings/octopus'
import type { TestDirectoryData } from './asset-reader'

interface TestUpdaterAssetReader {
  getTestsDirectoryData: () => Promise<TestDirectoryData[]>
}

type TestAssets = {
  components: Octopus['OctopusDocument'][]
  manifest: Manifest['OctopusManifest']
  expectedDirPath: string | null
  testName: string
  testPath: string
}

export class TestUpdater {
  private _assetsReader: TestUpdaterAssetReader
  private _octopusConverter: OctopusPSDConverter

  constructor(assetsReader: TestUpdaterAssetReader) {
    this._assetsReader = assetsReader
    this._octopusConverter = new OctopusPSDConverter({})
  }

  private async _getTestsAssets(): Promise<TestAssets[]> {
    const testsDirectoryData = await this._assetsReader.getTestsDirectoryData()
    const results = await Promise.all(
      testsDirectoryData.map(async ({ designPath, expectedDirPath, testName, testPath }) => {
        const sourceDesign = await getSourceDesign(designPath)
        if (!sourceDesign) {
          console.error('SourceDesign failed:', designPath)
          return null
        }

        const result = await this._octopusConverter.convertDesign({ sourceDesign })
        if (!result) {
          console.error('Convert Design failed:', designPath)
          return null
        }
        const { components: componentsResults, manifest } = result

        return {
          components: componentsResults
            .map((componentConversionResult) => componentConversionResult.value)
            .filter((component): component is Octopus['OctopusDocument'] => Boolean(component)),
          manifest,
          expectedDirPath,
          testName,
          testPath,
        }
      })
    )
    return results.filter((asset): asset is TestAssets => asset !== null)
  }

  private _cleanupExpectedDirs(testsAssets: TestAssets[]): Promise<(TestAssets & { expectedDirPath: string })[]> {
    return Promise.all(
      testsAssets.map(async (testAssets) => {
        const { expectedDirPath } = testAssets
        if (expectedDirPath) {
          await rmDir(expectedDirPath)
        }

        const createdExpectedDirPath = path.join(testAssets.testPath, AssetReader.EXPECTED_DIR_NAME)

        await makeDir(createdExpectedDirPath)

        return { ...testAssets, expectedDirPath: createdExpectedDirPath }
      })
    )
  }

  private _saveAssets(testAssets: (TestAssets & { expectedDirPath: string })[]): Promise<string[][]> {
    return Promise.all(
      testAssets.map(async ({ components, manifest, expectedDirPath }) => {
        const manifestPath = path.join(expectedDirPath, MANIFEST_NAME)
        await saveFile(manifestPath, stringify(manifest))

        return Promise.all(
          components.map((component) => {
            const componentPath = path.join(expectedDirPath, getOctopusFileName(component.id))
            return saveFile(componentPath, stringify(component))
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
