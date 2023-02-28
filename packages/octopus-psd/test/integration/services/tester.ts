import path from 'path'

import * as jsondiffpatch from 'jsondiffpatch'

import { createConverter } from '../../../src/index-node.js'
import { getOctopusFileName, MANIFEST_NAME } from '../../../src/utils/exporter.js'
import { cleanManifest } from '../utils/asset-cleaner.js'
import { getSourceDesign } from '../utils/source.js'
import { stringify } from '../utils/stringify.js'

import type { OctopusPSDConverter } from '../../../src/octopus-psd-converter.js'
import type { Manifest } from '../../../src/typings/manifest.js'
import type { Octopus } from '../../../src/typings/octopus.js'
import type { AssetReader, TestComponents, Component } from './asset-reader.js'

type ComponentGroup = {
  expected: Component<Octopus['OctopusComponent']> | null
  generated: Octopus['OctopusComponent']
}

type ConvertedDesign = {
  designId: string
  components: ComponentGroup[]
  manifest: { expected: Component<Manifest['OctopusManifest']> | null; generated?: Manifest['OctopusManifest'] }
}

export type Fail = {
  name: string
  json: string
  diff: string
}

interface TesterAssetReader {
  getTestsComponents: () => Promise<TestComponents[]>
}

const IGNORE_FIELDS = ['id', 'version', 'converterVersion']

export class Tester {
  private _assetsReader: TesterAssetReader
  private _octopusConverter: OctopusPSDConverter

  constructor(assetsReader: AssetReader) {
    this._assetsReader = assetsReader
    this._octopusConverter = createConverter()
  }

  private _mapComponents({
    expected,
    generated,
  }: {
    expected?: Component<Octopus['OctopusComponent']>[]
    generated: Octopus['OctopusComponent'][]
  }): ComponentGroup[] {
    return generated.map((generatedComponent) => {
      return {
        generated: generatedComponent,
        expected: expected
          ? expected.find(({ path: componentPath }) => {
              return path.basename(componentPath) === getOctopusFileName(generatedComponent.id)
            }) ?? null
          : null,
      }
    })
  }

  private async _getDesigns(testComponentsArray: TestComponents[]): Promise<ConvertedDesign[]> {
    const convertedDesigns = testComponentsArray.map(
      async ({ components: componentComponents, manifest: manifestExpected, designPath, designId }) => {
        const sourceDesign = await getSourceDesign(designPath)
        if (!sourceDesign) {
          console.error('SourceDesign failed:', designPath)
          return null
        }

        const result = await this._octopusConverter.convertDesign({ sourceDesign })
        if (!result) {
          console.error('Convert Design failed:', designPath)
          return null
        }
        const { components: componentsGenerated, manifest: manifestGenerated } = result

        const generatedComponents = componentsGenerated
          .map((conversionResult) => conversionResult.value)
          .filter((component): component is Octopus['OctopusComponent'] => Boolean(component))

        const components: ConvertedDesign['components'] = this._mapComponents({
          expected: componentComponents,
          generated: generatedComponents,
        })

        const manifest: ConvertedDesign['manifest'] = {
          expected: manifestExpected,
          generated: cleanManifest(manifestGenerated),
        }

        return { designId, components, manifest }
      }
    )

    const results = await Promise.all(convertedDesigns)

    return results.filter((design): design is ConvertedDesign => Boolean(design))
  }

  private _parseName(path: string) {
    return path.split('/').slice(-2).join('/')
  }

  private _compareComponents({
    components,
    differ,
    designId,
  }: {
    components: ComponentGroup[]
    differ: jsondiffpatch.DiffPatcher
    designId: string
  }): Promise<Fail[]> {
    const failedComponents = components.reduce<Promise<Fail[]>>(async (failedComponents, componentGroup) => {
      const { generated, expected } = componentGroup
      const expectedComponent = await expected?.read()
      const delta = differ.diff(expectedComponent, generated)

      if (delta) {
        const failed = await failedComponents
        const nameExt = expected?.path ? path.basename(expected?.path) : `missing artboard ${generated.id}`

        failed.push({
          name: `${designId} / ${nameExt}`,
          json: stringify(generated),
          diff: jsondiffpatch.formatters.html.format(delta, expectedComponent),
        })
      }

      return failedComponents
    }, Promise.resolve([]))

    return failedComponents
  }

  private async _compare(designs: ConvertedDesign[]): Promise<Fail[]> {
    const differ = jsondiffpatch.create({
      propertyFilter: (name: string) => !IGNORE_FIELDS.includes(name),
    })

    const failed = await designs.reduce<Promise<Fail[]>>(async (failedDesign, { components, manifest, designId }) => {
      const failed = await failedDesign

      const failedComponents = await this._compareComponents({ differ, designId, components })

      if (failedComponents.length) {
        failed.push(...failedComponents)
      }

      const { expected, generated } = manifest
      const expectedManifest = await expected?.read()
      const manifestDelta = differ.diff(expectedManifest, generated)

      if (manifestDelta) {
        failed.push({
          name: `${designId} / ${MANIFEST_NAME}`,
          json: stringify(generated),
          diff: jsondiffpatch.formatters.html.format(manifestDelta, expectedManifest),
        })
      }

      return failed
    }, Promise.resolve([]))

    return failed
  }

  async test(): Promise<Fail[]> {
    const savedTestComponents = await this._assetsReader.getTestsComponents()

    const designs = await this._getDesigns(savedTestComponents)

    return this._compare(designs)
  }
}
