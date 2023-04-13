import { DesignConverter } from './services/conversion/design-converter/index.js'
import { setPlatformFactories } from './services/general/platforms/index.js'
import { setDefaults, setLogger } from './services/index.js'
import { readPackageMeta } from './utils/read-pkg-meta.js'

import type { SourceDesign } from './entities/source/source-design.js'
import type { ConvertDesignResult } from './services/conversion/design-converter/index.js'
import type { AIExporter } from './services/conversion/exporters/index.js'
import type { NodeFactories, WebFactories } from './services/general/platforms/index.js'
import type { Logger } from './typings/index.js'
import type { PackageMeta } from './utils/read-pkg-meta.js'

export type OctopusAIConverteOptions = {
  platformFactories: WebFactories | NodeFactories
  /** Optional custom Logger. If not passed, default logger will be used. */
  logger?: Logger
  loggerEnabled?: boolean
}

export type ConvertDesignOptions = {
  /**
   * SourceDesign instance encapsulates all the source design data.
   * It consists of artboards, images and other assets.
   * It's possible to generate using either built-in `AIFileReader` or by custom reader.
   */
  sourceDesign: SourceDesign
  /**
   * Designates after how many milliseconds during the conversion process
   * file containing metadata (OctopusManifest) gets periodically updated
   */
  partialUpdateInterval?: number
  exporter?: AIExporter
}

/**
 * Octopus AI Converter
 * Main class for converting Adobe Illustrator documents to Octopus3 schema.
 *
 * There are three main processing steps:
 * - reading source data (using _reader)
 * - conversion (using `.convertDesign()` method with `SourceDesign` instance produced by reader)
 * - exporting (using _exporter)
 */
export class OctopusAIConverter {
  private _pkg: PackageMeta

  constructor(options: OctopusAIConverteOptions) {
    this._setGlobals(options)
    this._pkg = readPackageMeta()
  }

  private _setGlobals(options: OctopusAIConverteOptions): void {
    setPlatformFactories(options.platformFactories)
    setDefaults({
      logger: { enabled: options.loggerEnabled ?? true },
    })
    if (options.logger) setLogger(options.logger)
  }

  /**
   * @returns {PackageMeta} Project's package meta information
   */
  get pkg(): PackageMeta {
    return this._pkg
  }

  /**
   * Converts given SourceDesign into Octopus entities
   * @param {ConvertDesignOptions} [options]
   * @returns {Promise<ConvertDesignResult | null>} ConvertDesignResult object
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

export type { AIExporter, SourceDesign }
