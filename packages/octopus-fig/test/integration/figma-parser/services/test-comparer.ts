import { createConverter } from '../../../../src/index-node'
import { BaseTestComparer } from '../../common/services/base-test-comparer'
import { cleanManifest } from '../../common/utils/asset-cleaner'
import { DesignEmitterMock } from './design-emitter-mock'

import type { OctopusFigConverter } from '../../../../src/octopus-fig-converter'
import type { Octopus } from '../../../../src/typings/octopus'
import type { TestComponents } from '../../common/services/asset-reader'
import type { ConvertedDesign } from '../../common/services/base-test-comparer'
import type { Fail } from '../../common/services/test-runner'

export class TestComparer extends BaseTestComparer {
  private _octopusConverter: OctopusFigConverter

  constructor() {
    super()
    this._octopusConverter = createConverter()
  }

  protected async _getDesigns(testComponents: TestComponents[]): Promise<ConvertedDesign[]> {
    return await Promise.all(
      testComponents.map(
        async ({ components: componentExpected, manifest: manifestExpected, sourceDataPath, assetId }) => {
          const designEmitter = new DesignEmitterMock(sourceDataPath)

          const result = await this._octopusConverter.convertDesign({ designEmitter })
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

  async test(testComponents: TestComponents[]): Promise<Fail[]> {
    const designs = await this._getDesigns(testComponents)
    return this._compare(designs)
  }
}
