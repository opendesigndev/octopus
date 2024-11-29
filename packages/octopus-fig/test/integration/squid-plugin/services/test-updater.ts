import path from 'path'

import { createConverter, SourcePluginReader } from '../../../../src/index-node.js'
import { getOctopusFileName } from '../../../../src/services/exporters/node/local-exporter.js'
import { MANIFEST_NAME } from '../../../../src/utils/const.js'
import { makeDir, saveFile, rmDir, parseJsonFromFile } from '../../../../src/utils/files.js'
import { AssetReader } from '../../common/services/asset-reader.js'
import { cleanManifest } from '../../common/utils/asset-cleaner.js'
import { stringify } from '../../common/utils/stringify.js'

import type { OctopusFigConverter } from '../../../../src/octopus-fig-converter.js'
import type { Manifest } from '../../../../src/typings/manifest.js'
import type { Octopus } from '../../../../src/typings/octopus.js'
import type { PluginSource } from '../../../../src/typings/plugin-source.js'
import type { TestDirectoryData } from '../../common/services/asset-reader.js'

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
      this._testsDirectoryData.map(async ({ sourceDataPath, expectedDirPath, testName, testPath }) => {
        const sourceData: PluginSource | null = await parseJsonFromFile(sourceDataPath)
        if (sourceData === null)
          throw new Error(`Wrong SourceData for testName: '${testName}' and sourceDataPath: '${sourceDataPath}'`)
        const reader = new SourcePluginReader(sourceData)

        const result = await this._octopusConverter.convertDesign({ designEmitter: reader.getSourceDesign() })
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
