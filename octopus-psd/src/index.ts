import readPackageUpAsync from 'read-pkg-up'
import type { NormalizedReadResult } from 'read-pkg-up'
import { v4 as uuidv4 } from 'uuid'

import { createEnvironment } from './services/general/environment'
import { createLogger } from './services/general/default-logger'
import { createSentry } from './services/general/sentry'
import { ArtboardConverter, ArtboardConversionOptions } from './services/conversion/artboard-converter'

import type { Logger } from './typings'

type OctopusPSDConverterOptions = {
  octopusId: string
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
    this._id = options?.octopusId || uuidv4()
    this._pkg = readPackageUpAsync({ cwd: __dirname })
    this._logger = options?.logger || createLogger()
    this._sentry = createSentry({
      dsn: process.env.SENTRY_DSN,
      logger: this._logger,
    })
  }

  get id() {
    return this._id
  }

  logWarn(msg: string, extra: object) {
    this._logger?.warn(msg, extra)
    this._sentry?.captureMessage(msg, extra)
  }

  get pkg() {
    return this._pkg.then((normalized) => {
      if (!normalized) {
        throw new Error(`File "package.json" not found, can't infer "version" property of Octopus`)
      }
      return normalized.packageJson
    })
  }

  convertArtboard(options: ArtboardConversionOptions) {
    return new ArtboardConverter({
      ...options,
      octopusConverter: this,
    }).convert()
  }
}
