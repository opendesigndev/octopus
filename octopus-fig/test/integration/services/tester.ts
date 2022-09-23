import path from 'path'

import * as jsondiffpatch from 'jsondiffpatch'

import { createConverter } from '../../../src/index-node'
import { getOctopusFileName, MANIFEST_FILE_NAME } from '../../../src/utils/exporter'
import { cleanManifest } from '../utils/asset-cleaner'
import { stringify } from '../utils/stringify'
import { DesignMock } from './design-mock'

import type { OctopusFigConverter } from '../../../src/octopus-fig-converter'
import type { Manifest } from '../../../src/typings/manifest'
import type { Octopus } from '../../../src/typings/octopus'
import type { TestComponents, Component } from './asset-reader'

type ArtboardGroup = { expected: Component<Octopus['OctopusDocument']> | null; generated: Octopus['OctopusDocument'] }

type ConvertedDesign = {
  assetId: string
  artboards: ArtboardGroup[]
  manifest: { expected: Component<Manifest['OctopusManifest']> | null; generated?: Manifest['OctopusManifest'] }
}

type CompareArtboardsOptions = {
  artboards: ArtboardGroup[]
  differ: jsondiffpatch.DiffPatcher
  assetId: string
}

type MapArtboardsOptions = {
  expected?: Component<Octopus['OctopusDocument']>[]
  generated: Octopus['OctopusDocument'][]
}

export type Fail = { name: string; json: string; diff: string }

export class Tester {
  private _testComponents: TestComponents[]
  private _octopusConverter: OctopusFigConverter

  constructor(testComponents: TestComponents[]) {
    this._testComponents = testComponents
    this._octopusConverter = createConverter()
  }

  private _mapArtboards({ expected, generated }: MapArtboardsOptions): ArtboardGroup[] {
    return generated.map((generatedArtboard) => {
      return {
        generated: generatedArtboard,
        expected: expected
          ? expected.find(({ path: artboardPath }) => {
              return path.basename(artboardPath) === getOctopusFileName(generatedArtboard.id)
            }) ?? null
          : null,
      }
    })
  }

  private async _getDesigns(testComponentsArray: TestComponents[]): Promise<ConvertedDesign[]> {
    return await Promise.all(
      testComponentsArray.map(
        async ({ artboards: artboardExpected, manifest: manifestExpected, eventDataPath, assetId }) => {
          const design = new DesignMock(eventDataPath)

          const result = await this._octopusConverter.convertDesign({ design })
          const { components, manifest: manifestGenerated } = result ?? {}

          const artboardsGenerated = (components ?? [])
            .map((conversionResult) => conversionResult.value)
            .filter((artboard): artboard is Octopus['OctopusDocument'] => Boolean(artboard))

          const artboards: ConvertedDesign['artboards'] = this._mapArtboards({
            expected: artboardExpected,
            generated: artboardsGenerated,
          })
          const manifest: ConvertedDesign['manifest'] = {
            expected: manifestExpected,
            generated: cleanManifest(manifestGenerated),
          }

          return { assetId, artboards, manifest }
        }
      )
    )
  }

  private _compareArtboards({ artboards, differ, assetId }: CompareArtboardsOptions): Promise<Fail[]> {
    const failedArtboards = artboards.reduce<Promise<Fail[]>>(async (failedArtboards, artboardGroup) => {
      const { generated, expected } = artboardGroup
      const expectedArtboard = await expected?.read()
      const delta = differ.diff(expectedArtboard, generated)

      if (delta) {
        const failed = await failedArtboards

        const nameExt = expected?.path ? path.basename(expected?.path) : `missing artboard ${generated.id}`

        failed.push({
          name: `${assetId} / ${nameExt}`,
          json: stringify(generated),
          diff: jsondiffpatch.formatters.html.format(delta, expectedArtboard),
        })
      }

      return failedArtboards
    }, Promise.resolve([]))

    return failedArtboards
  }

  private _compare(designs: ConvertedDesign[]): Promise<Fail[]> {
    const differ = jsondiffpatch.create()

    const failed = designs.reduce<Promise<Fail[]>>(async (failedDesign, { artboards, manifest, assetId }) => {
      const failed = await failedDesign

      const failedArtboards = await this._compareArtboards({ differ, assetId, artboards })
      if (failedArtboards.length) {
        failed.push(...failedArtboards)
      }

      const { expected, generated: manifestGenerated } = manifest
      const manifestExpected = await expected?.read()
      const manifestDelta = differ.diff(manifestExpected, manifestGenerated)

      if (manifestDelta) {
        failed.push({
          name: `${assetId} / ${MANIFEST_FILE_NAME}`,
          json: stringify(manifestGenerated),
          diff: jsondiffpatch.formatters.html.format(manifestDelta, manifestExpected),
        })
      }

      return failed
    }, Promise.resolve([]))

    return failed
  }

  async test(): Promise<Fail[]> {
    const designs = await this._getDesigns(this._testComponents)
    return this._compare(designs)
  }
}
