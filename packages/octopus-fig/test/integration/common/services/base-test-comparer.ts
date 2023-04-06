import path from 'path'

import * as jsondiffpatch from 'jsondiffpatch'

import { getOctopusFileName } from '../../../../src/services/exporters/node/local-exporter.js'
import { MANIFEST_NAME } from '../../../../src/utils/const.js'
import { stringify } from '../utils/stringify.js'

import type { Component, TestComponents } from './asset-reader.js'
import type { Fail } from './test-runner.js'
import type { Manifest } from '../../../../src/typings/manifest.js'
import type { Octopus } from '../../../../src/typings/octopus.js'

export type ComponentGroup = {
  expected: Component<Octopus['OctopusComponent']> | null
  generated: Octopus['OctopusComponent']
}

export type ConvertedDesign = {
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

const IGNORE_FIELDS = ['version', 'converterVersion']

export abstract class BaseTestComparer {
  protected _mapComponents({ expected, generated }: MapComponentsOptions): ComponentGroup[] {
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

  protected _compareComponents({ components, differ, assetId }: CompareComponentsOptions): Promise<Fail[]> {
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

  protected _compare(designs: ConvertedDesign[]): Promise<Fail[]> {
    const differ = jsondiffpatch.create({
      propertyFilter: (name: string) => !IGNORE_FIELDS.includes(name),
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

  test(_testComponents: TestComponents[]): Promise<Fail[]> {
    throw new Error('Subclass of "TestComparer" has no "test" method implemented!')
  }
}
