import { AIFileReader } from './services/conversion/ai-file-reader'
import { DesignConverter, LocalExporter, TempExporter } from './services/conversion/design-converter'
import { set as setLogger } from './services/instances/logger'
import { readPackageMeta } from './utils/read-pkg-meta'

import type { SourceDesign } from './entities/source/source-design'
import type { ConvertDesignResult } from './services/conversion/design-converter'
import type { Exporter } from './services/conversion/exporters'
import type { Logger } from './typings'
import type { ProjectPackage } from './utils/read-pkg-meta'

type OctopusAIConverteOptions = {
  logger?: Logger
}

export class OctopusAIConverter {
  private _pkg: ProjectPackage

  constructor(options: OctopusAIConverteOptions) {
    this._setupLogger(options?.logger)
    this._pkg = readPackageMeta()
  }

  private _setupLogger(logger?: Logger) {
    if (logger) setLogger(logger)
  }

  get pkg(): ProjectPackage {
    return this._pkg
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

export { LocalExporter, TempExporter, AIFileReader }
export type { Exporter, SourceDesign }
