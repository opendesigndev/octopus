import path from 'path'
import { performance } from 'perf_hooks'
import readPackageUpAsync from 'read-pkg-up'
import { isObject, push } from '@avocode/octopus-common/dist/utils/common'

import createEnvironment from './services/general/environment'
import createSentry from './services/general/sentry'
import ArtboardConverter from './services/conversion/artboard-converter'
import OctopusManifest from './entities/octopus/octopus-manifest'
import { OctopusManifestReport } from './typings/manifest'
import { logger, set as setLogger } from './services/instances/logger'
import { XDFileReader } from './services/conversion/xd-file-reader'
import { LocalExporter } from './services/conversion/exporter/local-exporter'
import { TempExporter } from './services/conversion/exporter/temp-exporter'

import type { NormalizedReadResult, NormalizedPackageJson } from 'read-pkg-up'
import type { Logger } from './typings'
import type SourceDesign from './entities/source/source-design'
import type { Octopus } from './typings/octopus'
import type { Exporter } from './services/conversion/exporter'

type ConvertDesignOptions = {
  exporter?: Exporter
}

type OctopusXDConverterGeneralOptions = {
  logger?: Logger
}

type OctopusXDConverterOptions = OctopusXDConverterGeneralOptions & {
  sourceDesign: SourceDesign
}

export type ArtboardConversionResult = {
  id: string
  value: Octopus['OctopusDocument'] | null
  error: Error | null
  time: number
}

export type DesignConversionResult = {
  manifest: OctopusManifestReport
  time: number
}

/**
 * Loading of .env file.
 */
createEnvironment()

export class OctopusXDConverter {
  private _pkg: Promise<NormalizedReadResult | undefined>
  private _sentry: ReturnType<typeof createSentry>
  private _sourceDesign: SourceDesign
  private _octopusManifest: OctopusManifest

  static EXPORTERS = {
    LOCAL: LocalExporter,
    TEMP: TempExporter,
  }

  static READERS = {
    FILE: XDFileReader,
  }

  constructor(options: OctopusXDConverterOptions) {
    this._setupLogger(options?.logger)
    this._pkg = readPackageUpAsync({ cwd: __dirname })
    this._sentry = createSentry({ dsn: process.env.SENTRY_DSN, logger })
    this._sourceDesign = options.sourceDesign
    this._octopusManifest = new OctopusManifest({ octopusXdConverter: this })
  }

  get octopusManifest(): OctopusManifest {
    return this._octopusManifest
  }

  get sourceDesign(): SourceDesign {
    return this._sourceDesign
  }

  private _setupLogger(logger?: Logger) {
    if (logger) setLogger(logger)
  }

  get sentry(): ReturnType<typeof createSentry> {
    return this._sentry
  }

  get pkg(): Promise<NormalizedPackageJson> {
    return this._pkg.then((normalized) => {
      if (!normalized) {
        throw new Error(`File "package.json" not found, can't infer "version" property of Octopus`)
      }
      return normalized.packageJson
    })
  }

  private async _convertArtboardByIdSafe(targetArtboardId: string) {
    try {
      const value = await new ArtboardConverter({
        targetArtboardId,
        octopusXdConverter: this,
      }).convert()

      return {
        value,
        error: null,
      }
    } catch (err) {
      return {
        value: null,
        error: err,
      }
    }
  }

  async convertArtboardById(targetArtboardId: string): Promise<ArtboardConversionResult> {
    const timeStart = performance.now()
    const { value, error } = await this._convertArtboardByIdSafe(targetArtboardId)
    const time = performance.now() - timeStart
    return { id: targetArtboardId, value, error, time }
  }

  async convertDesign(options?: ConvertDesignOptions): Promise<{
    manifest: OctopusManifestReport
    artboards: ArtboardConversionResult[]
    images: { path: string; getImageData: () => Promise<Buffer> }[]
  }> {
    const exporter = isObject(options?.exporter) ? (options?.exporter as Exporter) : null

    this.octopusManifest.registerBasePath(await exporter?.getBasePath?.())

    /** Whole SourceDesign entity - mainly for dev purposes */
    exporter?.exportSourceDesign?.(this._sourceDesign)

    /** Images */
    const images = await Promise.all(
      this._sourceDesign.images.map(async (image) => {
        const imageId = path.basename(image.path)
        const rawData = await image.getImageData()
        const imagePath = await exporter?.exportImage?.(image.path, rawData)
        if (typeof imagePath === 'string') {
          this.octopusManifest.setExportedImage(imageId, imagePath)
        }
        return image
      })
    )

    /** Artboards */
    const artboards = await this._sourceDesign.artboards.reduce(async (queue, artboard) => {
      const artboards = await queue
      const converted = await this.convertArtboardById(artboard.meta.id)
      const artboardPath = await exporter?.exportArtboard?.(artboard, converted)
      if (typeof artboardPath === 'string') {
        this.octopusManifest.setExportedArtboard(artboard.meta.id, artboardPath)
      }
      return push(artboards, converted)
    }, Promise.resolve([]))

    /** Manifest */
    const timeStart = performance.now()
    const manifest = await this.octopusManifest.convert()
    const time = performance.now() - timeStart

    await exporter?.exportManifest?.({ manifest, time })

    return {
      manifest,
      artboards,
      images,
    }
  }
}

export { LocalExporter }
export { TempExporter }
export { XDFileReader }
