import path from 'path'

import { LocalExporter } from '../../../src/index-node'
import { getDirsFromDir, getFilesFromDir } from '../../../src/utils/files'
import { lazyRead } from '../utils'

import type { Manifest } from '../../../src/typings/manifest'
import type { Octopus } from '../../../src/typings/octopus'

export type Component<T> = {
  path: string
  read: () => Promise<T>
}

export type TestComponents = {
  eventDataPath: string
  artboards: Component<Octopus['OctopusDocument']>[]
  manifest: Component<Manifest['OctopusManifest']>
}

export type TestDirectoryData = {
  testName: string
  testPath: string
  eventDataPath: string
  expectedDirPath: string | null
}

type TestDirectoryFullData = TestDirectoryData & {
  expectedPaths: string[]
}

export type AssetReaderOptions = Partial<{ selectedAsset: string }>

export class AssetReader {
  private _assetsDirPath: string
  private _selectedAsset?: string

  static EVENT_DATA_NAME = 'eventData.json'
  static ASSETS_DIR_RELATIVE_PATH = '../assets'
  static EXPECTED_DIR_NAME = 'expected'

  constructor({ selectedAsset }: AssetReaderOptions) {
    this._assetsDirPath = this._getFullPath()
    this._selectedAsset = selectedAsset
  }

  private _getFullPath(...subpaths: string[]) {
    return path.join(__dirname, AssetReader.ASSETS_DIR_RELATIVE_PATH, ...subpaths)
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
      eventDataPath: this._getFullPath(testName, AssetReader.EVENT_DATA_NAME),
    }))
  }

  async getTestsComponents(): Promise<TestComponents[]> {
    const testDirectoryTrees = await this._getTestDirectoryFullData()

    return testDirectoryTrees.map((testDirectoryTree): TestComponents => {
      const manifest = testDirectoryTree.expectedPaths.find(
        (filePath) => path.basename(filePath) === LocalExporter.MANIFEST_PATH
      )
      const artboards = testDirectoryTree.expectedPaths.filter((filePath) =>
        /[0-9]+-octopus\.json$/.test(path.basename(filePath))
      )

      if (!artboards?.length) {
        console.error(`missing artboards in: ${testDirectoryTree.testName}/${AssetReader.EXPECTED_DIR_NAME}`)
      }

      if (!manifest) {
        throw new Error(`missing manifest in: ${testDirectoryTree.testName}/${AssetReader.EXPECTED_DIR_NAME}`)
      }

      return {
        eventDataPath: testDirectoryTree.eventDataPath,
        manifest: {
          path: manifest,
          read: lazyRead(manifest),
        },
        artboards: artboards.map((artboard) => {
          return {
            path: artboard,
            read: lazyRead(artboard),
          }
        }),
      }
    })
  }
}
