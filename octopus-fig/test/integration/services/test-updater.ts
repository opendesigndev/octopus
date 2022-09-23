import fsp from 'fs/promises'
import path from 'path'

import { createConverter } from '../../../src/index-node'
import { getOctopusFileName, MANIFEST_FILE_NAME } from '../../../src/utils/exporter'
import { cleanManifest } from '../utils/asset-cleaner'
import { stringify } from '../utils/stringify'
import { AssetReader } from './asset-reader'
import { DesignMock } from './design-mock'

import type { OctopusFigConverter } from '../../../src/octopus-fig-converter'
import type { Manifest } from '../../../src/typings/manifest'
import type { Octopus } from '../../../src/typings/octopus'
import type { TestDirectoryData } from './asset-reader'

type TestAssets = {
  components: Octopus['OctopusDocument'][]
  manifest?: Manifest['OctopusManifest']
  expectedDirPath: string | null
  testName: string
  testPath: string
}

export class TestUpdater {
  private _testsDirectoryData: TestDirectoryData[]
  private _octopusConverter: OctopusFigConverter

  constructor(_testsDirectoryData: TestDirectoryData[]) {
    this._testsDirectoryData = _testsDirectoryData
    this._octopusConverter = createConverter()
  }

  private async _getTestsAssets(): Promise<TestAssets[]> {
    return Promise.all(
      this._testsDirectoryData.map(async ({ eventDataPath, expectedDirPath, testName, testPath }) => {
        const design = new DesignMock(eventDataPath)

        const result = await this._octopusConverter.convertDesign({ design })
        const { components, manifest } = result ?? {}

        return {
          components: (components ?? [])
            .map((conversionResult) => conversionResult.value)
            .filter((component): component is Octopus['OctopusDocument'] => Boolean(component)),
          manifest: cleanManifest(manifest),
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

        const createdExpectedDirPath = path.join(testAssets.testPath, AssetReader.EXPECTED_DIR_NAME)

        await fsp.mkdir(createdExpectedDirPath)

        return { ...testAssets, expectedDirPath: createdExpectedDirPath }
      })
    )
  }

  private _saveAssets(testAssets: (TestAssets & { expectedDirPath: string })[]): Promise<void[][]> {
    return Promise.all(
      testAssets.map(async ({ components, manifest, expectedDirPath }) => {
        const manifestPath = path.join(expectedDirPath, MANIFEST_FILE_NAME)
        await fsp.writeFile(manifestPath, stringify(manifest))

        return Promise.all(
          components.map((component) => {
            const componentPath = path.join(expectedDirPath, getOctopusFileName(component.id))
            return fsp.writeFile(componentPath, stringify(component))
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
