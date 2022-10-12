import { DesignConverter } from './services/conversion/design-converter'
import { DebugExporter } from './services/exporters/debug-exporter'
import { LocalExporter } from './services/exporters/local-exporter'
import { createEnvironment } from './services/general/environment'
import { set as setLogger } from './services/instances/logger'
import { PSDFileReader } from './services/readers/psd-file-reader'
import { SourceFileReader } from './services/readers/source-file-reader'
import { readPackageMeta } from './utils/read-pkg-meta'

import type { ConvertDesignResult, DesignConverterOptions } from './services/conversion/design-converter'
import type { Logger } from './typings'

export { LocalExporter, DebugExporter }
export { PSDFileReader, SourceFileReader }

type OctopusPSDConverterOptions = {
  logger?: Logger
}

/**
 * Loading of .env file.
 */
createEnvironment()

export class OctopusPSDConverter {
  static EXPORTERS = {
    LOCAL: LocalExporter,
    DEBUG: DebugExporter,
  }

  static READERS = {
    PSD: PSDFileReader,
    SOURCE: SourceFileReader,
  }

  constructor(options?: OctopusPSDConverterOptions) {
    this._setupLogger(options?.logger)
  }

  private _setupLogger(logger?: Logger) {
    if (logger) setLogger(logger)
  }

  get pkgVersion(): string {
    return readPackageMeta().version
  }

  async convertDesign(options: DesignConverterOptions): Promise<ConvertDesignResult | null> {
    return new DesignConverter(options, this).convert()
  }
}
