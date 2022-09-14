import fsp from 'fs/promises'
import path from 'path'

import * as jsondiffpatch from 'jsondiffpatch'

import { OctopusAIConverter } from '../../src'
import { logger } from '../../src/services/instances/logger'
import { AssetsReader } from './assets-reader'

import type { Manifest } from '../../src/typings/manifest'
import type { Octopus } from '../../src/typings/octopus'
import type { TestComponents, Component } from './assets-reader'

type TesterOptions = {
  assetsReader: AssetsReader
  isUpdate: boolean
}

type ArtboardGroup = { saved: Component<Octopus['OctopusDocument']> | null; generated: Octopus['OctopusDocument'] }

type ConvertedDesign = {
  designPath: string
  artboards: ArtboardGroup[]
  manifest: { saved: Component<Manifest['OctopusManifest']> | null; generated: Manifest['OctopusManifest'] }
}

export type Fail = {
  name: string
  json: string
  diff: string
}

export class Tester {
  private _assetsReader: AssetsReader
  private _isUpdate: boolean
  private _octopusAIConverter: OctopusAIConverter

  static ARTBOARD_FILENAME_PREFIX = 'octopus-'
  static PATH_SLICE_BEFORE_NAME = 'assets/'

  constructor({ assetsReader, isUpdate }: TesterOptions) {
    this._assetsReader = assetsReader
    this._isUpdate = isUpdate
    this._octopusAIConverter = new OctopusAIConverter({})
  }

  private async _cleanTestDir(dirPath: string) {
    const assetNames = await fsp.readdir(dirPath)

    return assetNames.map((assetName) => {
      if (path.extname(assetName) === AssetsReader.DESIGN_FILE_EXTENSION) {
        return
      }

      const assetPath = path.join(dirPath, assetName)

      return fsp.unlink(assetPath)
    })
  }

  private _saveAssets(designs: ConvertedDesign[]): Promise<Promise<void>[]>[] {
    return designs.map(async ({ manifest: { generated }, artboards, designPath }) => {
      const dirPath = path.dirname(designPath)

      await Promise.all(await this._cleanTestDir(dirPath))

      const manifestPath = path.join(dirPath, 'manifest.json')
      await fsp.writeFile(manifestPath, JSON.stringify(generated))

      return artboards.map(({ generated }) => {
        const artboardPath = path.join(dirPath, `${Tester.ARTBOARD_FILENAME_PREFIX}${generated.id}.json`)
        return fsp.writeFile(artboardPath, JSON.stringify(generated))
      })
    })
  }

  private _mapArtboards({
    saved,
    generated,
  }: {
    saved?: Component<Octopus['OctopusDocument']>[]
    generated: Octopus['OctopusDocument'][]
  }): ArtboardGroup[] {
    return generated.map((generatedArtboard) => {
      return {
        generated: generatedArtboard,
        saved: saved
          ? saved.find(({ path: artboardPath }) => {
              const savedId = path
                .basename(artboardPath)
                .replace(Tester.ARTBOARD_FILENAME_PREFIX, '')
                .replace('.json', '')
              return savedId === generatedArtboard.id
            }) ?? null
          : null,
      }
    })
  }

  private async _getDesigns(testComponentsArray: TestComponents[]): Promise<Promise<ConvertedDesign>[]> {
    const convertedDesigns = testComponentsArray.map(
      async ({ artboards: artboardComponents, manifest: manifestComponent, designPath }) => {
        const converter = await this._octopusAIConverter.getDesignConverter(designPath)
        const { artboards: artboardConversionResults, manifest } = await converter.convertDesign()

        const generatedArtboards = artboardConversionResults
          .map((conversionResult) => conversionResult.value)
          .filter((artboard) => artboard) as Octopus['OctopusDocument'][]

        return {
          artboards: this._mapArtboards({ saved: artboardComponents, generated: generatedArtboards }),
          manifest: { saved: manifestComponent ?? null, generated: manifest },
          designPath,
        }
      }
    )

    return convertedDesigns
  }

  private _parseName(path: string) {
    return path.substring(path.search(Tester.PATH_SLICE_BEFORE_NAME) + Tester.PATH_SLICE_BEFORE_NAME.length)
  }

  private _compare(designs: ConvertedDesign[]): Promise<Fail[]> {
    const differ = jsondiffpatch.create()

    const failed = designs.reduce<Promise<Fail[]>>(async (failedDesign, { artboards, manifest, designPath }) => {
      const failed = await failedDesign

      const failedArtboards = await artboards.reduce<Promise<Fail[]>>(async (failedArtboards, artboardGroup) => {
        const { generated, saved } = artboardGroup
        const savedArtboard = await saved?.read()
        const delta = differ.diff(savedArtboard, generated)
        if (delta) {
          logger.info('Error in artboards')
          const failed = await failedArtboards
          const name = saved?.path ? this._parseName(saved.path) : `${designPath} missing artboard ${generated.id}`

          failed.push({
            name,
            json: JSON.stringify(generated, null, '  '),
            diff: jsondiffpatch.formatters.html.format(delta, savedArtboard),
          })
        }

        return failedArtboards
      }, Promise.resolve([]))

      if (failedArtboards.length) {
        failed.push(...failedArtboards)
      }

      const { saved, generated } = manifest
      const savedManifest = await saved?.read()
      const manifestDelta = differ.diff(savedManifest, generated)

      if (manifestDelta) {
        logger.info('Delta in manifest')

        failed.push({
          name: saved?.path ?? `${designPath} missing manifest`,
          json: JSON.stringify(generated, null, '  '),
          diff: jsondiffpatch.formatters.html.format(manifestDelta, savedManifest),
        })
      }

      return failed
    }, Promise.resolve([]))

    return failed
  }

  async test(): Promise<Fail[] | null> {
    const savedTestComponents = await this._assetsReader.getTestComponents()

    const designs = await Promise.all(await this._getDesigns(savedTestComponents))

    if (this._isUpdate) {
      await Promise.all(this._saveAssets(designs))
      return null
    }

    return this._compare(designs)
  }
}
