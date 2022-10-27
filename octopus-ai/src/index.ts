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
  /** Optional custom Logger. If not passed, default logger will be used. */
  logger?: Logger
}

export type ConvertDesignOptions = {
  /** SourceDesign instance encapsulates all the source design data. It consists of artboards, images and other assets. It's possible to generate using either built-in `PSDFileReader` or by custom reader. */
  sourceDesign: SourceDesign
  /** OctopusManifest updating Interval (in milliseconds) */
  partialUpdateInterval?: number
  /** Optional Exporter. */
  exporter?: Exporter
}

/**
 * Octopus AI Converter
 * Main class for converting Adobe Illustrator documents to Octopus3 schema.
 *
 * There are three main processing steps:
 * - reading source data (using _reader_)
 * - conversion (using `.convertDesign()` method with `SourceDesign` instance produced by reader)
 * - exporting (using _exporter_)
 */
export class OctopusAIConverter {
  private _pkg: ProjectPackage

  constructor(options: OctopusAIConverteOptions) {
    this._setupLogger(options?.logger)
    this._pkg = readPackageMeta()
  }

  private _setupLogger(logger?: Logger) {
    if (logger) setLogger(logger)
  }

  /**
   * Returns version from package.json
   * @returns {string} version
   */
  get pkgVersion(): string {
    return this._pkg.version
  }

  /**
   * Converts given SourceDesign into Octopus entities
   * @param {ConvertDesignOptions} [options]
   * @returns {Promise<ConvertDesignResult | null>} returns ConvertDesignResult object
   */
  convertDesign({ exporter, sourceDesign, partialUpdateInterval }: ConvertDesignOptions): Promise<ConvertDesignResult> {
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
