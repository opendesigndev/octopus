import path from 'path'

import * as jsondiffpatch from 'jsondiffpatch'

import { createConverter } from '../../../src/index-node'
// import { createO ctopusArtboardFileName } from '../../../src/utils/exporter'

import type { SourceDesign } from '../../../src/entities/source/source-design'
import type { OctopusFigConverter } from '../../../src/octopus-fig-converter'
import type { Manifest } from '../../../src/typings/manifest'
import type { Octopus } from '../../../src/typings/octopus'
import type { AssetReader, TestComponents, Component } from './asset-reader'
import { DesignMock } from './design-mock'

type ArtboardGroup = { expected: Component<Octopus['OctopusDocument']> | null; generated: Octopus['OctopusDocument'] }

type ConvertedDesign = {
  artboards: ArtboardGroup[]
  manifest: { expected: Component<Manifest['OctopusManifest']> | null; generated: Manifest['OctopusManifest'] }
}

export type Fail = {
  name: string
  json: string
  diff: string
}

interface TesterAssetReader {
  getTestsComponents: () => Promise<TestComponents[]>
}

export class Tester {
  private _assetsReader: TesterAssetReader
  private _octopusConverter: OctopusFigConverter

  constructor(assetsReader: AssetReader) {
    this._assetsReader = assetsReader
    this._octopusConverter = createConverter()
  }

  // private _mapArtboards({
  //   expected,
  //   generated,
  // }: {
  //   expected?: Component<Octopus['OctopusDocument']>[]
  //   generated: Octopus['OctopusDocument'][]
  // }): ArtboardGroup[] {
  //   return generated.map((generatedArtboard) => {
  //     return {
  //       generated: generatedArtboard,
  //       expected: expected
  //         ? expected.find(({ path: artboardPath }) => {
  //             return path.basename(artboardPath) === createOctopusArtboardFileName(generatedArtboard.id)
  //           }) ?? null
  //         : null,
  //     }
  //   })
  // }

  private async _getDesigns(testComponentsArray: TestComponents[]): Promise<ConvertedDesign[]> {
    console.info()
    console.info()
    console.info('testComponentsArray', testComponentsArray)
    console.info()

    const convertedDesigns = testComponentsArray.map(
      async ({ artboards: artboardComponents, manifest: manifestComponent, eventDataPath }) => {
        console.info()
        console.info('HERE HERE')
        console.info()
        const design = new DesignMock(eventDataPath)

        const result = await this._octopusConverter.convertDesign({ design })

        console.info()
        console.info()
        console.info('result', result)
        console.info()

        const { components, manifest } = result ?? {}

        console.info()
        console.info()
        console.info('manifest', manifest)
        console.info()
        console.info('components', components)
        console.info()
        console.info()
        console.info()

        // const generatedArtboards = (components ?? [])
        //   .map((conversionResult) => conversionResult.value)
        //   .filter((artboard): artboard is Octopus['OctopusDocument'] => Boolean(artboard))

        // return {
        //   artboards: this._mapArtboards({ expected: artboardComponents, generated: generatedArtboards }),
        //   manifest: { expected: manifestComponent, generated: manifest },
        // }
      }
    )

    await Promise.all(convertedDesigns) // TODO
    return [] // TODO

    // return convertedDesigns
  }

  // private _parseName(path: string) {
  //   return path.split('/').slice(-2).join('/')
  // }

  // private _compareArtboards({
  //   artboards,
  //   differ,
  //   designPath,
  // }: {
  //   artboards: ArtboardGroup[]
  //   differ: jsondiffpatch.DiffPatcher
  //   designPath: string
  // }): Promise<Fail[]> {
  //   const failedArtboards = artboards.reduce<Promise<Fail[]>>(async (failedArtboards, artboardGroup) => {
  //     const { generated, expected } = artboardGroup
  //     const expectedArtboard = await expected?.read()
  //     const delta = differ.diff(expectedArtboard, generated)

  //     if (delta) {
  //       const failed = await failedArtboards
  //       const name = expected?.path ? this._parseName(expected.path) : `${designPath} missing artboard ${generated.id}`

  //       failed.push({
  //         name,
  //         json: JSON.stringify(generated, null, '  '),
  //         diff: jsondiffpatch.formatters.html.format(delta, expectedArtboard),
  //       })
  //     }

  //     return failedArtboards
  //   }, Promise.resolve([]))

  //   return failedArtboards
  // }

  // private _compare(designs: ConvertedDesign[]): Promise<Fail[]> {
  //   const differ = jsondiffpatch.create()

  //   const failed = designs.reduce<Promise<Fail[]>>(async (failedDesign, { artboards, manifest, designPath }) => {
  //     const failed = await failedDesign

  //     const failedArtboards = await this._compareArtboards({ differ, designPath, artboards })

  //     if (failedArtboards.length) {
  //       failed.push(...failedArtboards)
  //     }

  //     const { expected, generated } = manifest
  //     const expectedManifest = await expected?.read()
  //     const manifestDelta = differ.diff(expectedManifest, generated)

  //     if (manifestDelta) {
  //       failed.push({
  //         name: expected?.path ?? `${designPath} missing manifest`,
  //         json: JSON.stringify(generated, null, '  '),
  //         diff: jsondiffpatch.formatters.html.format(manifestDelta, expectedManifest),
  //       })
  //     }

  //     return failed
  //   }, Promise.resolve([]))

  //   return failed
  // }

  async test(): Promise<Fail[]> {
    const savedTestComponents = await this._assetsReader.getTestsComponents()

    const designs = await this._getDesigns(savedTestComponents)

    console.info()
    console.info()
    console.info()
    console.info()
    console.info('designs')
    console.info(designs)
    console.info()
    console.info()
    console.info()

    return [] // TODO REMOVE
    // return this._compare(designs)
  }
}
