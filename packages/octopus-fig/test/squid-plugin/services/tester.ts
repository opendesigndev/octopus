import path from 'path'

import * as jsondiffpatch from 'jsondiffpatch'

import { createConverter, SourcePluginReader } from '../../../src/index-node'
import { getOctopusFileName } from '../../../src/services/exporters/node/local-exporter'
import { MANIFEST_NAME } from '../../../src/utils/const'
import { parseJsonFromFile } from '../../../src/utils/files'
import { cleanManifest } from '../utils/asset-cleaner'
import { stringify } from '../utils/stringify'

import type { OctopusFigConverter } from '../../../src/octopus-fig-converter'
import type { Manifest } from '../../../src/typings/manifest'
import type { Octopus } from '../../../src/typings/octopus'
import type { PluginSource } from '../../../src/typings/plugin-source'
import type { TestComponents, Component } from './asset-reader'

type ComponentGroup = {
  expected: Component<Octopus['OctopusComponent']> | null
  generated: Octopus['OctopusComponent']
}

type ConvertedDesign = {
  assetId: string
  components: ComponentGroup[]
  manifest: { expected: Component<Manifest['OctopusManifest']> | null; generated?: Manifest['OctopusManifest'] }
}

type CompareComponentsOptions = {
  assetId: string
  components: ComponentGroup[]
  differ: jsondiffpatch.DiffPatcher
}

type MapComponentsOptions = {
  expected?: Component<Octopus['OctopusComponent']>[]
  generated: Octopus['OctopusComponent'][]
}

export type Fail = { name: string; json: string; diff: string }

export class Tester {
  private _testComponents: TestComponents[]
  private _octopusConverter: OctopusFigConverter

  constructor(testComponents: TestComponents[]) {
    this._testComponents = testComponents
    this._octopusConverter = createConverter()
  }

  private _mapComponents({ expected, generated }: MapComponentsOptions): ComponentGroup[] {
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
    return await Promise.all(
      testComponentsArray.map(
        async ({ components: componentExpected, manifest: manifestExpected, pluginDataPath, assetId }) => {
          const sourceData: PluginSource | null = await parseJsonFromFile(pluginDataPath)
          if (sourceData === null)
            throw new Error(`Wrong SourceData for assetId: '${assetId}' and pluginDataPath: '${pluginDataPath}'`)
          const reader = new SourcePluginReader(sourceData)

          const result = await this._octopusConverter.convertDesign({ designEmitter: reader.parse() })
          const { components: componentsGenerated, manifest: manifestGenerated } = result ?? {}

          const componentsGenValues = (componentsGenerated ?? [])
            .map((conversionResult) => conversionResult.value)
            .filter((component): component is Octopus['OctopusComponent'] => Boolean(component))

          const components: ConvertedDesign['components'] = this._mapComponents({
            expected: componentExpected,
            generated: componentsGenValues,
          })
          const manifest: ConvertedDesign['manifest'] = {
            expected: manifestExpected,
            generated: cleanManifest(manifestGenerated),
          }

          return { assetId, components, manifest }
        }
      )
    )
  }

  private _compareComponents({ components, differ, assetId }: CompareComponentsOptions): Promise<Fail[]> {
    const failedComponents = components.reduce<Promise<Fail[]>>(async (failedComponents, componentGroup) => {
      const { generated, expected } = componentGroup
      const expectedComponent = await expected?.read()
      const delta = differ.diff(expectedComponent, generated)

      if (delta) {
        const failed = await failedComponents

        const nameExt = expected?.path ? path.basename(expected?.path) : `missing component ${generated.id}`

        failed.push({
          name: `${assetId} / ${nameExt}`,
          json: stringify(generated),
          diff: jsondiffpatch.formatters.html.format(delta, expectedComponent),
        })
      }

      return failedComponents
    }, Promise.resolve([]))

    return failedComponents
  }

  private _compare(designs: ConvertedDesign[]): Promise<Fail[]> {
    const differ = jsondiffpatch.create({
      propertyFilter: (name: string) => {
        return name === 'version' ? false : true // ignore version
      },
    })

    const failed = designs.reduce<Promise<Fail[]>>(async (failedDesign, { components, manifest, assetId }) => {
      const failed = await failedDesign

      const failedComponents = await this._compareComponents({ differ, assetId, components })
      if (failedComponents.length) {
        failed.push(...failedComponents)
      }

      const { expected, generated: manifestGenerated } = manifest
      const manifestExpected = await expected?.read()
      const manifestDelta = differ.diff(manifestExpected, manifestGenerated)

      if (manifestDelta) {
        failed.push({
          name: `${assetId} / ${MANIFEST_NAME}`,
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
