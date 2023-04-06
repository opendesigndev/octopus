import path from 'path'

import { MANIFEST_NAME } from '../../../../src/utils/const.js'
import { getDirsFromDir, getFilesFromDir } from '../../../../src/utils/files.js'
import { lazyRead } from '../utils/lazy-read.js'

import type { Manifest } from '../../../../src/typings/manifest.js'
import type { Octopus } from '../../../../src/typings/octopus.js'

export type Component<T> = {
  path: string
  read: () => Promise<T | null>
}

export type TestComponents = {
  assetId: string
  sourceDataPath: string
  components: Component<Octopus['OctopusComponent']>[]
  manifest: Component<Manifest['OctopusManifest']>
}

export type TestDirectoryData = {
  testName: string
  testPath: string
  sourceDataPath: string
  expectedDirPath: string | null
}

type TestDirectoryFullData = TestDirectoryData & {
  expectedPaths: string[]
}

export type AssetReaderOptions = {
  sourceFileName: string
  testDirPath: string
  selectedAsset?: string
}

export class AssetReader {
  private _assetsDirPath: string
  private _sourceFileName: string
  private _selectedAsset?: string

  static ASSETS_DIR_RELATIVE_PATH = './assets'
  static EXPECTED_DIR_NAME = 'expected'

  constructor({ selectedAsset, testDirPath, sourceFileName }: AssetReaderOptions) {
    this._assetsDirPath = path.join(testDirPath, AssetReader.ASSETS_DIR_RELATIVE_PATH)
    this._sourceFileName = sourceFileName
    this._selectedAsset = selectedAsset
  }

  private _getFullPath(...subpaths: string[]) {
    return path.join(this._assetsDirPath, ...subpaths)
  }

  private async _getTestDirectoryFullData(): Promise<TestDirectoryFullData[]> {
    const testDirectories = await this.getTestsDirectoryData()
    return Promise.all(
      testDirectories.map(async (testDirectoryData) => {
        const { expectedDirPath } = testDirectoryData
        const expectedSubpaths = expectedDirPath
          ? ((await getFilesFromDir(expectedDirPath)) ?? []).map((file) => file.name)
          : []

        return {
          ...testDirectoryData,
          expectedPaths: expectedDirPath ? expectedSubpaths.map((subpath) => path.join(expectedDirPath, subpath)) : [],
        }
      })
    )
  }

  async getTestsDirectoryData(): Promise<TestDirectoryData[]> {
    const testNames = this._selectedAsset
      ? [this._selectedAsset]
      : ((await getDirsFromDir(this._assetsDirPath)) ?? []).map((dir) => dir.name)

    return testNames.map((testName) => ({
      testName,
      testPath: this._getFullPath(testName),
      expectedDirPath: this._getFullPath(testName, AssetReader.EXPECTED_DIR_NAME),
      sourceDataPath: this._getFullPath(testName, this._sourceFileName),
    }))
  }

  async getTestsComponents(): Promise<TestComponents[]> {
    const testDirectoryTrees = await this._getTestDirectoryFullData()

    return testDirectoryTrees.map((testDirectoryTree): TestComponents => {
      const manifest = testDirectoryTree.expectedPaths.find((filePath) => path.basename(filePath) === MANIFEST_NAME)
      const components = testDirectoryTree.expectedPaths
        .filter((filePath) => /octopus/.test(path.basename(filePath)))
        .filter((filePath) => path.basename(filePath) !== 'octopus-manifest.json')

      if (!components?.length) {
        console.error(`missing components in: ${testDirectoryTree.testName}/${AssetReader.EXPECTED_DIR_NAME}`)
      }

      if (!manifest) {
        throw new Error(`missing manifest in: ${testDirectoryTree.testName}/${AssetReader.EXPECTED_DIR_NAME}`)
      }

      return {
        assetId: testDirectoryTree.testName,
        sourceDataPath: testDirectoryTree.sourceDataPath,
        manifest: { path: manifest, read: lazyRead(manifest) },
        components: components.map((component) => ({ path: component, read: lazyRead(component) })),
      }
    })
  }
}
