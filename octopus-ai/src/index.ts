import readPackageUpAsync from 'read-pkg-up'

import { DesignConverter } from './services/conversion/design-converter'
import { set as setLogger } from './services/instances/logger'

import type { SourceDesign } from './entities/source/source-design'
import type { ConvertDesignResult } from './services/conversion/design-converter'
import type { Exporter } from './services/conversion/exporters'
import type { Logger } from './typings'
import type { NormalizedPackageJson, NormalizedReadResult } from 'read-pkg-up'

type OctopusAIConverteOptions = {
  logger?: Logger
}

export class OctopusAIConverter {
  private _pkg: Promise<NormalizedReadResult | undefined>

  constructor(options: OctopusAIConverteOptions) {
    this._setupLogger(options?.logger)
    this._pkg = readPackageUpAsync({ cwd: __dirname })
  }

  private _setupLogger(logger?: Logger) {
    if (logger) setLogger(logger)
  }

  get pkg(): Promise<NormalizedPackageJson> {
    return this._pkg.then((normalized) => {
      if (!normalized) {
        throw new Error(`File "package.json" not found, can't infer "version" property of Octopus`)
      }
      return normalized.packageJson
    })
  }

  async convertDesign({
    exporter,
    sourceDesign,
    partialUpdateInterval,
  }: {
    exporter?: Exporter
    sourceDesign: SourceDesign
    partialUpdateInterval?: number
  }): Promise<ConvertDesignResult> {
    const designConverter = new DesignConverter({
      sourceDesign,
      octopusAIconverter: this,
      exporter,
      partialUpdateInterval,
    })

    return designConverter.convert()
  }
}
