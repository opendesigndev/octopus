import readPackageUpAsync from 'read-pkg-up'
import type { NormalizedReadResult } from 'read-pkg-up'
import { v4 as uuidv4 } from 'uuid'

import { createEnvironment } from './services/general/environment'
import { logger, set as setLogger } from './services/instances/logger'
import { set as setSentry } from './services/instances/sentry'
import { createSentry } from './services/general/sentry'
import { ArtboardConverter, ArtboardConversionOptions } from './services/conversion/artboard-converter'

import type { Logger } from './typings'
import type { Octopus } from './typings/octopus'
import type { SourceDesign } from './entities/source/source-design'
import { OctopusManifestReport } from './typings/manifest'
import { OctopusManifest } from './entities/octopus/octopus-manifest'
import { SourceArtboard } from './entities/source/source-artboard'

type OctopusPSDConverterOptions = {
  designId: string
  logger?: Logger
}

type ConvertDesignOptions = {
  sourceDesign: SourceDesign
}

type ConversionResult = {
  targetArtboardId: string
  value: Octopus['OctopusDocument'] | undefined
  error: Error | null
  time: number
}

/**
 * Loading of .env file.
 */
createEnvironment()

export class OctopusPSDConverter {
  private _id: string
  private _pkg: Promise<NormalizedReadResult | undefined>

  constructor(options?: OctopusPSDConverterOptions) {
    this._id = options?.designId || uuidv4()
    this._pkg = readPackageUpAsync({ cwd: __dirname })

    this._setupLogger(options?.logger)
    setSentry(
      createSentry({
        dsn: process.env.SENTRY_DSN,
        logger,
      })
    )
  }

  get id(): string {
    return this._id
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

  private async _convertArtboardSafe(options: ArtboardConversionOptions) {
    try {
      const value = await new ArtboardConverter({ ...options, octopusConverter: this }).convert()
      return { value, error: null }
    } catch (error) {
      return { error }
    }
  }

  private async _convertArtboard(options: ArtboardConversionOptions): Promise<ConversionResult> {
    const timeStart = performance.now()
    const { value, error } = await this._convertArtboardSafe(options)
    const time = performance.now() - timeStart

    const targetArtboardId = value?.id ?? SourceArtboard.DEFAULT_ID
    return { targetArtboardId, value, error, time }
  }

  async convertDesign(
    options: ConvertDesignOptions
  ): Promise<{ manifest: OctopusManifestReport; artboards: ConversionResult[] }> {
    const artboard = await this._convertArtboard({ sourceDesign: options.sourceDesign })

    const manifest = await new OctopusManifest({
      sourceDesign: options.sourceDesign,
      octopusConverter: this,
    }).convert()

    return {
      manifest,
      artboards: [artboard],
    }
  }
}
