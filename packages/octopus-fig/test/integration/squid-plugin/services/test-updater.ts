import path from 'path'

import { createConverter, SourcePluginReader } from '../../../../src/index-node'
import { getOctopusFileName } from '../../../../src/services/exporters/node/local-exporter'
import { MANIFEST_NAME } from '../../../../src/utils/const'
import { makeDir, saveFile, rmDir, parseJsonFromFile } from '../../../../src/utils/files'
import { cleanManifest } from '../utils/asset-cleaner'
import { stringify } from '../utils/stringify'
import { AssetReader } from './asset-reader'

import type { OctopusFigConverter } from '../../../../src/octopus-fig-converter'
import type { Manifest } from '../../../../src/typings/manifest'
import type { Octopus } from '../../../../src/typings/octopus'
import type { PluginSource } from '../../../../src/typings/plugin-source'
import type { TestDirectoryData } from './asset-reader'

type TestAssets = {
  components: Octopus['OctopusComponent'][]
  manifest?: Manifest['OctopusManifest']
  expectedDirPath: string | null
  testName: string
  testPath: string
}

export class TestUpdater {
  private _testsDirectoryData: TestDirectoryData[]
  private _octopusConverter: OctopusFigConverter

  constructor(testsDirectoryData: TestDirectoryData[]) {
    this._testsDirectoryData = testsDirectoryData
    this._octopusConverter = createConverter()
  }

  private async _getTestsAssets(): Promise<TestAssets[]> {
    return Promise.all(
      this._testsDirectoryData.map(async ({ pluginDataPath, expectedDirPath, testName, testPath }) => {
        const sourceData: PluginSource | null = await parseJsonFromFile(pluginDataPath)
        if (sourceData === null)
          throw new Error(`Wrong SourceData for testName: '${testName}' and pluginDataPath: '${pluginDataPath}'`)
        const reader = new SourcePluginReader(sourceData)

        const result = await this._octopusConverter.convertDesign({ designEmitter: reader.parse() })
        const { components, manifest } = result ?? {}

        return {
          components: (components ?? [])
            .map((conversionResult) => conversionResult.value)
            .filter((component): component is Octopus['OctopusComponent'] => Boolean(component)),
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
          await rmDir(expectedDirPath)
        }

        const createdExpectedDirPath = path.join(testAssets.testPath, AssetReader.EXPECTED_DIR_NAME)

        await makeDir(createdExpectedDirPath)

        return { ...testAssets, expectedDirPath: createdExpectedDirPath }
      })
    )
  }

  private async _saveAssets(testAssets: (TestAssets & { expectedDirPath: string })[]): Promise<void> {
    for (const { components, manifest, expectedDirPath } of testAssets) {
      const manifestPath = path.join(expectedDirPath, MANIFEST_NAME)
      await saveFile(manifestPath, stringify(manifest))

      for (const component of components) {
        const componentPath = path.join(expectedDirPath, getOctopusFileName(component.id))
        await saveFile(componentPath, stringify(component))
      }
    }
  }

  async update(): Promise<void> {
    const testsAssets = await this._getTestsAssets()
    const testAssetsWithCleanExpectedDirs = await this._cleanupExpectedDirs(testsAssets)
    await this._saveAssets(testAssetsWithCleanExpectedDirs)
  }
}
