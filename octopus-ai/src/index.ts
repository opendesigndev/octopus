import readPackageUpAsync from 'read-pkg-up'

import { DesignConverter } from './services/conversion/design-converter'
import { LocalExporter } from './services/conversion/exporter/local-exporter'
import { TempExporter } from './services/conversion/exporter/temp-exporter'
import { set as setLogger } from './services/instances/logger'

import type { SourceDesign } from './entities/source/source-design'
import type { Logger } from './typings'
import type { NormalizedPackageJson, NormalizedReadResult } from 'read-pkg-up'

type OctopusAIConverteOptions = {
  logger?: Logger
}

export class OctopusAIConverter {
  private _pkg: Promise<NormalizedReadResult | undefined>
  private _sourceDesign: SourceDesign

  static EXPORTERS = {
    LOCAL: LocalExporter,
    TEMP: TempExporter,
  }

  constructor(options: OctopusAIConverteOptions) {
    this._setupLogger(options?.logger)
    this._pkg = readPackageUpAsync({ cwd: __dirname })
  }

  get sourceDesign(): SourceDesign {
    return this._sourceDesign
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

  getDesignConverter(filePath: string): Promise<DesignConverter> {
    return DesignConverter.fromPath({ octopusAIconverter: this, filePath })
  }
}

export { LocalExporter }
export { TempExporter }
