import readPackageUpAsync from 'read-pkg-up'
import type { NormalizedReadResult } from 'read-pkg-up'
import { v4 as uuidv4 } from 'uuid'

import { createEnvironment } from './services/general/environment'
import { logger, set as setLogger } from './services/instances/logger'
import { createSentry } from './services/general/sentry'
import { ArtboardConverter, ArtboardConversionOptions } from './services/conversion/artboard-converter'

import type { Logger } from './typings'
import type { Octopus } from './typings/octopus'

type OctopusPSDConverterOptions = {
  designId: string
  logger?: Logger
}

/**
 * Loading of .env file.
 */
createEnvironment()

export class OctopusPSDConverter {
  private _id: string
  private _pkg: Promise<NormalizedReadResult | undefined>
  private _logger: Logger
  private _sentry: ReturnType<typeof createSentry>

  constructor(options?: OctopusPSDConverterOptions) {
    this._id = options?.designId || uuidv4()
    this._pkg = readPackageUpAsync({ cwd: __dirname })
    this._setupLogger(options?.logger)
    this._sentry = createSentry({
      dsn: process.env.SENTRY_DSN,
      logger,
    })
  }

  get id(): string {
    return this._id
  }

  private _setupLogger(logger?: Logger) {
    if (logger) setLogger(logger)
  }

  logWarn(msg: string, extra: unknown): void {
    this._logger?.warn(msg, extra)
    this._sentry?.captureMessage(msg)
  }

  get pkgVersion(): Promise<string> {
    return this._pkg.then((normalized) => {
      if (!normalized) {
        throw new Error(`File "package.json" not found, can't infer "version" property of Octopus`)
      }
      return normalized.packageJson.version
    })
  }

  convertArtboard(options: ArtboardConversionOptions): Promise<Octopus['OctopusDocument']> {
    return new ArtboardConverter({
      ...options,
      octopusConverter: this,
    }).convert()
  }
}
