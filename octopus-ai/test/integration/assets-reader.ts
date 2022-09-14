import fsp from 'fs/promises'
import path from 'path'

import { lazyRead } from '../../src/utils/test-utils'

import type { Manifest } from '../../src/typings/manifest'
import type { Octopus } from '../../src/typings/octopus'

export type Component<T> = {
  path: string
  read: () => Promise<T>
}

export type TestComponents = {
  designPath: string
  artboards?: Component<Octopus['OctopusDocument']>[]
  manifest?: Component<Manifest['OctopusManifest']>
}

export type AssetsReaderOptions = Partial<{ selectedTest: string; isUpdate: boolean }>

export class AssetsReader {
  private _assetsDirPath: string
  private _selectedTest?: string
  private _isUpdate: boolean

  static DESIGN_FILE_EXTENSION = '.ai'
  static ASSETS_DIR_SUBPATH = 'test/integration/assets'

  constructor({ selectedTest, isUpdate }: AssetsReaderOptions) {
    this._assetsDirPath = this._cwd(AssetsReader.ASSETS_DIR_SUBPATH)
    this._selectedTest = selectedTest
    this._isUpdate = isUpdate ?? false
  }

  private _cwd(path: string) {
    return `${process.cwd()}/${path}`
  }

  private async _getAssetsPaths(): Promise<string[][]> {
    const assetSubpaths = await fsp.readdir(this._assetsDirPath)
    const filteredAssetSubpaths = this._selectedTest
      ? assetSubpaths.filter((subpath) => subpath === this._selectedTest)
      : assetSubpaths

    if (filteredAssetSubpaths.length === 0) {
      console.error('No files found!')
    }
    const assetsDirectories = filteredAssetSubpaths.map((assetDirSubpath) =>
      path.join(this._assetsDirPath, assetDirSubpath)
    )

    return Promise.all(
      assetsDirectories.map(async (assetDirname) => {
        return (await fsp.readdir(assetDirname)).map((assetSubpath) => path.join(assetDirname, assetSubpath))
      })
    )
  }

  async getTestComponents(): Promise<TestComponents[]> {
    const assetpaths = await this._getAssetsPaths()

    return assetpaths.map((assetArray) => {
      const designComponents = assetArray.reduce<TestComponents>(
        (components, assetPath) => {
          if (assetPath.includes('manifest') && path.extname(assetPath) === '.json') {
            return { ...components, manifest: { path: assetPath, read: lazyRead(assetPath) } }
          }

          if (assetPath.includes('octopus') && path.extname(assetPath) === '.json') {
            if (!components.artboards) {
              components.artboards = []
            }

            components.artboards.push({ path: assetPath, read: lazyRead(assetPath) })

            return components
          }

          if (path.extname(assetPath) === AssetsReader.DESIGN_FILE_EXTENSION) {
            return { ...components, designPath: assetPath }
          }

          return components
        },
        { designPath: '' }
      )

      if (!designComponents.designPath) {
        throw new Error(`No design path in ${JSON.stringify(assetArray)}`)
      }

      if (!designComponents?.artboards?.length && this._isUpdate === false) {
        console.error(`missing artboards in: ${path.dirname(designComponents.designPath)}`)
      }

      if (!designComponents.manifest && this._isUpdate === false) {
        console.error(`missing manifest in: ${path.dirname(designComponents.designPath)}`)
      }

      return designComponents
    })
  }
}
