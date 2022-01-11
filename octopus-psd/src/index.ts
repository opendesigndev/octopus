import readPackageUpAsync from 'read-pkg-up'
import { v4 as uuidv4 } from 'uuid'

import { createEnvironment } from './services/general/environment'
import { createLogger } from './services/general/default-logger'
import { createSentry } from './services/general/sentry'

import type { NormalizedReadResult } from 'read-pkg-up'
import type { Logger } from './typings'
import ArtboardConverter, { ArtboardConversionOptions } from './services/conversion/artboard-converter'

type OctopusPSDConverterOptions = {
  octopusId: string
  logger?: Logger
}

/**
 * Loading of .env file.
 */
createEnvironment()

/**
 * @TODO
 * Should we publish it as @avocode/octopus-xd?
 * Should we expand?
 */

export class OctopusPSDConverter {
  _id: string
  _pkg: Promise<NormalizedReadResult | undefined>
  _logger: Logger
  _sentry: ReturnType<typeof createSentry>

  constructor(options?: OctopusPSDConverterOptions) {
    this._id = options?.octopusId || uuidv4()
    this._pkg = readPackageUpAsync({ cwd: __dirname })
    this._logger = options?.logger || createLogger()
    this._sentry = createSentry({
      dsn: process.env.SENTRY_DSN,
      logger: this._logger,
    })
  }

  get logger() {
    return this._logger
  }

  get sentry() {
    return this._sentry
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
