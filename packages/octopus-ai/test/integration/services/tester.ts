import path from 'path'

import * as jsondiffpatch from 'jsondiffpatch'

import { createConverter } from '../../../src/index-node.js'
import { AIFileReader } from '../../../src/services/readers/node/index.js'
import { createOctopusArtboardFileName } from '../../../src/utils/exporter.js'
import { getSourceDesign } from '../utils.js'

import type { AssetsReader, TestComponents, Component } from './assets-reader.js'
import type { SourceDesign } from '../../../src/entities/source/source-design.js'
import type { OctopusAIConverter } from '../../../src/octopus-ai-converter.js'
import type { Octopus } from '../../../src/typings/octopus/index.js'
import type { Manifest } from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'

type ArtboardGroup = { expected: Component<Octopus['OctopusComponent']> | null; generated: Octopus['OctopusComponent'] }

type ConvertedDesign = {
  designPath: string
  artboards: ArtboardGroup[]
  manifest: { expected: Component<Manifest['OctopusManifest']> | null; generated: Manifest['OctopusManifest'] }
}

export type Fail = {
  name: string
  json: string
  diff: string
}

interface TesterAssetsReader {
  getTestsComponents: () => Promise<TestComponents[]>
}

const IGNORE_FIELDS = ['version', 'converterVersion']

export class Tester {
  private _assetsReader: TesterAssetsReader
  private _octopusAIConverter: OctopusAIConverter

  constructor(assetsReader: AssetsReader) {
    this._assetsReader = assetsReader
    this._octopusAIConverter = createConverter()
  }

  private _mapArtboards({
    expected,
    generated,
  }: {
    expected?: Component<Octopus['OctopusComponent']>[]
    generated: Octopus['OctopusComponent'][]
  }): ArtboardGroup[] {
    return generated.map((generatedArtboard) => {
      return {
        generated: generatedArtboard,
        expected: expected
          ? expected.find(({ path: artboardPath }) => {
              return path.basename(artboardPath) === createOctopusArtboardFileName(generatedArtboard.id)
            }) ?? null
          : null,
      }
    })
  }

  private _getDesigns(testComponentsArray: TestComponents[]): Promise<ConvertedDesign>[] {
    const convertedDesigns = testComponentsArray.map(
      async ({ artboards: artboardComponents, manifest: manifestComponent, designPath }) => {
        const fileReader = new AIFileReader({ path: designPath })
        const sourceDesign: SourceDesign = await getSourceDesign(fileReader)

        const { artboards: artboardConversionResults, manifest } = await this._octopusAIConverter.convertDesign({
          sourceDesign,
        })
        fileReader.cleanup()
        const generatedArtboards = artboardConversionResults
          .map((conversionResult) => conversionResult.value)
          .filter((artboard): artboard is Octopus['OctopusComponent'] => Boolean(artboard))

        return {
          artboards: this._mapArtboards({ expected: artboardComponents, generated: generatedArtboards }),
          manifest: { expected: manifestComponent, generated: manifest },
          designPath,
        }
      }
    )
    return convertedDesigns
  }

  private _parseName(path: string) {
    return path.split('/').slice(-2).join('/')
  }

  private _compareArtboards({
    artboards,
    differ,
    designPath,
  }: {
    artboards: ArtboardGroup[]
    differ: jsondiffpatch.DiffPatcher
    designPath: string
  }): Promise<Fail[]> {
    const failedArtboards = artboards.reduce<Promise<Fail[]>>(async (failedArtboards, artboardGroup) => {
      const { generated, expected } = artboardGroup
      const expectedArtboard = await expected?.read()
      const delta = differ.diff(expectedArtboard, generated)

      if (delta) {
        const failed = await failedArtboards
        const name = expected?.path ? this._parseName(expected.path) : `${designPath} missing artboard ${generated.id}`

        failed.push({
          name,
          json: JSON.stringify(generated, null, '  '),
          diff: jsondiffpatch.formatters.html.format(delta, expectedArtboard),
        })
      }

      return failedArtboards
    }, Promise.resolve([]))

    return failedArtboards
  }

  private _compare(designs: ConvertedDesign[]): Promise<Fail[]> {
    const differ = jsondiffpatch.create({
      propertyFilter: (name: string) => !IGNORE_FIELDS.includes(name),
    })

    const failed = designs.reduce<Promise<Fail[]>>(async (failedDesign, { artboards, manifest, designPath }) => {
      const failed = await failedDesign

      const failedArtboards = await this._compareArtboards({ differ, designPath, artboards })

      if (failedArtboards.length) {
        failed.push(...failedArtboards)
      }

      const { expected, generated } = manifest
      const expectedManifest = await expected?.read()
      const manifestDelta = differ.diff(expectedManifest, generated)

      if (manifestDelta) {
        failed.push({
          name: expected?.path ?? `${designPath} missing manifest`,
          json: JSON.stringify(generated, null, '  '),
          diff: jsondiffpatch.formatters.html.format(manifestDelta, expectedManifest),
        })
      }

      return failed
    }, Promise.resolve([]))

    return failed
  }

  async test(): Promise<Fail[]> {
    const savedTestComponents = await this._assetsReader.getTestsComponents()
    const designs = await Promise.all(this._getDesigns(savedTestComponents))
    return this._compare(designs)
  }
}
