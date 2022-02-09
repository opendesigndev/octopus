import { performance } from 'perf_hooks'
import readPackageUpAsync from 'read-pkg-up'

import createEnvironment from './services/general/environment'
import createLogger from './services/general/default-logger'
import createSentry from './services/general/sentry'
import ArtboardConverter from './services/conversion/artboard-converter'

import type { NormalizedReadResult } from 'read-pkg-up'
import type { Logger } from './typings'
import type { ArtboardConversionOptions } from './services/conversion/artboard-converter'
import type SourceDesign from './entities/source/source-design'
import type { Octopus } from './typings/octopus'
import OctopusManifest from './entities/octopus/octopus-manifest'


type OctopusXDConverterOptions = {
  logger?: Logger
}

type ConvertDesignOptions = {
  sourceDesign: SourceDesign
}

type ConversionResult = {
  targetArtboardId: string,
  value: Octopus['OctopusDocument'] | undefined,
  error: Error | null,
  time: number
}

/**
 * Loading of .env file.
 */
createEnvironment()

export default class OctopusXDConverter {
  private _pkg: Promise<NormalizedReadResult | undefined>
  // Services
  private _logger: Logger
  private _sentry: ReturnType<typeof createSentry>

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

  private async _convertArtboardByIdSafe(options: ArtboardConversionOptions) {
    try {
      const value = await new ArtboardConverter({
        ...options,
        octopusXdConverter: this
      }).convert()
      
      return {
        value,
        error: null
      }
    } catch (err) {
      return {
        value: undefined,
        error: err
      }
    }
  }

  async convertDesign(options: ConvertDesignOptions) {
    const artboards = await Promise.all(options.sourceDesign.artboards.map(artboard => {
      return this.convertArtboardById({
        targetArtboardId: artboard.meta.id,
        sourceDesign: options.sourceDesign
      })
    }))

    const manifest = await new OctopusManifest({
      sourceDesign: options.sourceDesign,
      octopusXdConverter: this
    }).convert()

    return {
      manifest,
      artboards
    }
  }

  async convertArtboardById(options: ArtboardConversionOptions): Promise<ConversionResult> {
    const timeStart = performance.now()
    const { value, error } = await this._convertArtboardByIdSafe(options)
    const time = performance.now() - timeStart

    return {
      targetArtboardId: options.targetArtboardId,
      value,
      error,
      time
    }
  }
}
