import { DesignConverter } from './services/conversion/design-converter'
import { DebugExporter } from './services/exporters/debug-exporter'
import { LocalExporter } from './services/exporters/local-exporter'
import { createEnvironment } from './services/general/environment'
import { set as setLogger } from './services/instances/logger'
import { PSDFileReader } from './services/readers/psd-file-reader'
import { SourceFileReader } from './services/readers/source-file-reader'
import { readPackageMeta } from './utils/read-pkg-meta'

import type { SourceDesign } from './entities/source/source-design'
import type { ConvertDesignResult } from './services/conversion/design-converter'
import type { AbstractExporter } from './services/exporters/abstract-exporter'
import type { Logger } from './typings'

export { LocalExporter, DebugExporter }
export { PSDFileReader, SourceFileReader }

export type OctopusPSDConverterOptions = {
  logger?: Logger
}

export type DesignConverterOptions = {
  sourceDesign: SourceDesign
  designId?: string
  exporter?: AbstractExporter
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

  /**
   * Octopus PSD converter.
   * @constructor
   * @param {OctopusPSDConverterOptions} [options]
   */
  constructor(options?: OctopusPSDConverterOptions) {
    this._setupLogger(options?.logger)
  }

  private _setupLogger(logger?: Logger) {
    if (logger) setLogger(logger)
  }

  /**
   * Returns version from package.json
   * @returns {string} version
   */
  get pkgVersion(): string {
    return readPackageMeta().version
  }

  /**
   * Converts given SourceDesign into Octopus entities
   * @param {DesignConverterOptions} [options]
   * @returns {Promise<ConvertDesignResult | null>} returns ConvertDesignResult object or null if conversion fails
   */
  async convertDesign(options: DesignConverterOptions): Promise<ConvertDesignResult | null> {
    return new DesignConverter(options, this).convert()
  }
}
