import fsp from 'fs/promises'
import path from 'path'

import { LocalExporter } from '../../../src/services/conversion/design-converter'
import { lazyRead } from '../utils'

import type { Manifest } from '../../../src/typings/manifest'
import type { Octopus } from '../../../src/typings/octopus'

export type Component<T> = {
  path: string
  read: () => Promise<T>
}

export type TestComponents = {
  designPath: string
  artboards: Component<Octopus['OctopusComponent']>[]
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

export type AssetsReaderOptions = Partial<{ selectedTest: string }>

export class AssetsReader {
  private _assetsDirPath: string
  private _selectedTest?: string

  static DESIGN_FILE_EXTENSION = '.ai'
  static ASSETS_DIR_RELATIVE_PATH = '../assets'
  static EXPECTED_DIR_NAME = 'expected'

  constructor({ selectedTest }: AssetsReaderOptions) {
    this._assetsDirPath = this._getFullPath([])
    this._selectedTest = selectedTest
  }

  private _getFullPath(subpaths: string[]) {
    return path.join(__dirname, AssetsReader.ASSETS_DIR_RELATIVE_PATH, ...subpaths)
  }

  private async _getTestDirectoryFullData(): Promise<TestDirectoryFullData[]> {
    const testDirectories = await this.getTestsDirectoryData()
    return Promise.all(
      testDirectories.map(async (testDirectoryData) => {
        const { expectedDirPath } = testDirectoryData
        const expectedSubpaths = expectedDirPath ? await fsp.readdir(expectedDirPath) : []

        return {
          ...testDirectoryData,
          expectedPaths: expectedDirPath ? expectedSubpaths.map((subpath) => path.join(expectedDirPath, subpath)) : [],
        }
      })
    )
  }

  async getTestsDirectoryData(): Promise<TestDirectoryData[]> {
    const testNames = await fsp.readdir(this._assetsDirPath)
    const filteredTestNames = this._selectedTest
      ? testNames.filter((testName) => testName === this._selectedTest)
      : testNames

    if (filteredTestNames.length === 0) {
      console.error('No files found!')
    }

    return Promise.all(
      filteredTestNames.map(async (testName) => {
        const testPath = this._getFullPath([testName])
        const testDirContent = await fsp.readdir(testPath)

        const expectedDirName = testDirContent.find((child) => child === AssetsReader.EXPECTED_DIR_NAME)
        const aiFileName = testDirContent.find((child) => child.endsWith(AssetsReader.DESIGN_FILE_EXTENSION))

        if (!aiFileName) {
          throw new Error(`Missing .ai file in ${testPath}`)
        }

        return {
          testName,
          testPath,
          expectedDirPath: expectedDirName ? this._getFullPath([testName, expectedDirName]) : null,
          designPath: this._getFullPath([testName, aiFileName]),
        }
      })
    )
  }

  async getTestsComponents(): Promise<TestComponents[]> {
    const testDirectoryTrees = await this._getTestDirectoryFullData()

    return testDirectoryTrees.map((testDirectoryTree): TestComponents => {
      const manifest = testDirectoryTree.expectedPaths.find(
        (filePath) => path.basename(filePath) === LocalExporter.OCTOPUS_MANIFEST_NAME
      )
      const artboards = testDirectoryTree.expectedPaths.filter((filePath) =>
        /octopus-[0-9]+\.json$/.test(path.basename(filePath))
      )

      if (!artboards?.length) {
        console.error(`missing artboards in: ${testDirectoryTree.testName}/${AssetsReader.EXPECTED_DIR_NAME}`)
      }

      if (!manifest) {
        throw new Error(`missing manifest in: ${testDirectoryTree.testName}/${AssetsReader.EXPECTED_DIR_NAME}`)
      }

      return {
        designPath: testDirectoryTree.designPath,
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
