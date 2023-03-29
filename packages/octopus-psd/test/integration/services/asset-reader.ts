import { basename, join as pathJoin } from 'path'
import * as url from 'url'

import { MANIFEST_NAME } from '../../../src/utils/exporter.js'
import { getDirsFromDir, getFilesFromDir } from '../../../src/utils/files.js'
import { lazyRead } from '../utils/lazy-read.js'

import type { Octopus } from '../../../src/typings/octopus.js'
import type { Manifest } from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'

export type Component<T> = {
  path: string
  read: () => Promise<T | null>
}

export type TestComponents = {
  designId: string
  designPath: string
  components: Component<Octopus['OctopusComponent']>[]
  manifest: Component<Manifest['OctopusManifest']>
}

export type TestDirectoryData = {
  testName: string
  testPath: string
  designPath: string
  expectedDirPath: string | null
}

type TestDirectoryFullData = TestDirectoryData & {
  expectedPaths: string[]
}

export type AssetReaderOptions = Partial<{ selectedTest: string }>

export class AssetReader {
  private _assetsDirPath: string
  private _selectedTest?: string

  static DESIGN_FILE_EXTENSION = '.psd'
  static ASSETS_DIR_RELATIVE_PATH = '../../../../test/integration/assets'
  static EXPECTED_DIR_NAME = 'expected'

  constructor({ selectedTest }: AssetReaderOptions) {
    this._assetsDirPath = this._getFullPath()
    this._selectedTest = selectedTest
  }

  private _getFullPath(...subpaths: string[]) {
    return pathJoin(url.fileURLToPath(new URL('.', import.meta.url)), AssetReader.ASSETS_DIR_RELATIVE_PATH, ...subpaths)
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
          expectedPaths: expectedDirPath ? expectedSubpaths.map((subpath) => pathJoin(expectedDirPath, subpath)) : [],
        }
      })
    )
  }

  async getTestsDirectoryData(): Promise<TestDirectoryData[]> {
    const testNames = this._selectedTest
      ? [this._selectedTest]
      : ((await getDirsFromDir(this._assetsDirPath)) ?? []).map((dir) => dir.name)

    if (testNames.length === 0) {
      console.error('No files found!')
    }

    return testNames.map((testName) => ({
      testName,
      testPath: this._getFullPath(testName),
      expectedDirPath: this._getFullPath(testName, AssetReader.EXPECTED_DIR_NAME),
      designPath: this._getFullPath(testName, `${testName}${AssetReader.DESIGN_FILE_EXTENSION}`),
    }))
  }

  async getTestsComponents(): Promise<TestComponents[]> {
    const testDirectoryTrees = await this._getTestDirectoryFullData()

    return testDirectoryTrees.map((testDirTree): TestComponents => {
      const manifest = testDirTree.expectedPaths.find((path) => basename(path) === MANIFEST_NAME)
      if (!manifest) throw new Error(`Missing manifest for asset: ${testDirTree.testName}`)

      const components = testDirTree.expectedPaths.filter(
        (path) => basename(path) !== MANIFEST_NAME && /octopus-.*\.json$/.test(basename(path))
      )
      if (!components?.length) throw new Error(`Missing components for asset: ${testDirTree.testName}`)

      return {
        designId: testDirTree.testName,
        designPath: testDirTree.designPath,
        manifest: {
          path: manifest,
          read: lazyRead(manifest),
        },
        components: components.map((component) => {
          return {
            path: component,
            read: lazyRead(component),
          }
        }),
      }
    })
  }
}
