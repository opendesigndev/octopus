import { createConverter, SourcePluginReader } from '../../../../src/index-node.js'
import { parseJsonFromFile } from '../../../../src/utils/files.js'
import { BaseTestComparer } from '../../common/services/base-test-comparer.js'
import { cleanManifest } from '../../common/utils/asset-cleaner.js'

import type { OctopusFigConverter } from '../../../../src/octopus-fig-converter.js'
import type { Octopus } from '../../../../src/typings/octopus.js'
import type { PluginSource } from '../../../../src/typings/plugin-source.js'
import type { TestComponents } from '../../common/services/asset-reader.js'
import type { ConvertedDesign } from '../../common/services/base-test-comparer.js'
import type { Fail } from '../../common/services/test-runner.js'

export class TestComparer extends BaseTestComparer {
  protected _octopusConverter: OctopusFigConverter

  constructor() {
    super()
    this._octopusConverter = createConverter()
  }

  protected async _getDesigns(testComponents: TestComponents[]): Promise<ConvertedDesign[]> {
    return await Promise.all(
      testComponents.map(
        async ({ components: componentExpected, manifest: manifestExpected, sourceDataPath, assetId }) => {
          const sourceData: PluginSource | null = await parseJsonFromFile(sourceDataPath)
          if (sourceData === null)
            throw new Error(`Wrong SourceData for assetId: '${assetId}' and sourceDataPath: '${sourceDataPath}'`)
          const reader = new SourcePluginReader(sourceData)

          const result = await this._octopusConverter.convertDesign({ designEmitter: reader.getSourceDesign() })
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
