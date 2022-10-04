import readPackageUpAsync from 'read-pkg-up'

import { DesignConverter } from './services/conversion/design-converter'
import { DebugExporter } from './services/exporters/debug-exporter'
import { LocalExporter } from './services/exporters/local-exporter'
import { createEnvironment } from './services/general/environment'
import { createSentry } from './services/general/sentry'
import { logger, set as setLogger } from './services/instances/logger'
import { set as setSentry } from './services/instances/sentry'
import { PSDFileReader } from './services/readers/psd-file-reader'
import { SourceFileReader } from './services/readers/source-file-reader'

import type { ConvertDesignResult, DesignConverterOptions } from './services/conversion/design-converter'
import type { Logger } from './typings'
import type { NormalizedReadResult } from 'read-pkg-up'

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
  private _pkg: Promise<NormalizedReadResult | undefined>

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
    setSentry(
      createSentry({
        dsn: process.env.SENTRY_DSN,
        logger,
      })
    )

    this._pkg = readPackageUpAsync({ cwd: __dirname })
  }

  private _setupLogger(logger?: Logger) {
    if (logger) setLogger(logger)
  }

  get pkgVersion(): Promise<string> {
    return this._pkg.then((normalized) => {
      if (!normalized) {
        throw new Error(`File "package.json" not found, can't infer "version" property of Octopus`)
      }
      return normalized.packageJson.version
    })
  }

  async convertDesign(options: DesignConverterOptions): Promise<ConvertDesignResult | null> {
    return new DesignConverter(options, this).convert()
  }
}
