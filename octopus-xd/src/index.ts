import readPackageUpAsync from 'read-pkg-up'

import createEnvironment from './services/general/environment'
import createLogger from './services/general/default-logger'
import createSentry from './services/general/sentry'

import type { NormalizedReadResult } from 'read-pkg-up'
import type { Logger } from './typings'
import ArtboardConverter, { ArtboardConversionOptions } from './services/conversion/artboard-converter'


type OctopusXDConverterOptions = {
  logger?: Logger
}

/**
 * Loading of .env file.
 */
createEnvironment()

export default class OctopusXDConverter {
  _pkg: Promise<NormalizedReadResult | undefined>
  // Services
  _logger: Logger
  _sentry: ReturnType<typeof createSentry>

  constructor(options?: OctopusXDConverterOptions) {
    this._pkg = readPackageUpAsync({ cwd: __dirname })
    this._logger = options?.logger || createLogger()
    this._sentry = createSentry({
      dsn: process.env.SENTRY_DSN,
      logger: this._logger
    })
  }

  get logger() {
    return this._logger
  }

  get sentry() {
    return this._sentry
  }

  get pkg() {
    return this._pkg.then(normalized => {
      if (!normalized) {
        throw new Error(`File "package.json" not found, can't infer "version" property of Octopus`)
      }
      return normalized.packageJson
    })
  }

  convertArtboardById(options: ArtboardConversionOptions) {
    return new ArtboardConverter({
      ...options,
      octopusXdConverter: this
    }).convert()
  }
}
