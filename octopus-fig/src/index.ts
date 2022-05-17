import { benchmarkAsync } from '@avocode/octopus-common/dist/utils/benchmark'
import { isObject, push } from '@avocode/octopus-common/dist/utils/common'
import { Queue, SafeResult } from '@avocode/octopus-common/dist/utils/queue'
import readPackageUpAsync from 'read-pkg-up'
import { v4 as uuidv4 } from 'uuid'

import { OctopusManifest } from './entities/octopus/octopus-manifest'
import { SourceArtboard } from './entities/source/source-artboard'
import { ArtboardConverter } from './services/conversion/artboard-converter'
import { LocalExporter } from './services/exporters/local-exporter'
import { TempExporter } from './services/exporters/temp-exporter'
import { createEnvironment } from './services/general/environment'
import { createSentry } from './services/general/sentry'
import { logger, set as setLogger } from './services/instances/logger'
import { set as setSentry } from './services/instances/sentry'
import { SourceFileReader } from './services/readers/source-file-reader'

import type { SourceDesign } from './entities/source/source-design'
import type { AbstractExporter } from './services/exporters/abstract-exporter'
import type { Logger } from './typings'
import type { Manifest } from './typings/manifest'
import type { Octopus } from './typings/octopus'
import type { NormalizedReadResult } from 'read-pkg-up'

export { LocalExporter, TempExporter }
export { SourceFileReader }

type ConvertDesignOptions = {
  exporter?: AbstractExporter
}

export type ConvertDesignResult = {
  manifest: Manifest['OctopusManifest']
  artboards: ArtboardConversionResult[]
  images: ExportImage[]
}

type OctopusConverterOptions = {
  sourceDesign: SourceDesign
  designId?: string
  logger?: Logger
}

export type ArtboardConversionResult = {
  id: string
  value: Octopus['OctopusDocument'] | null
  error: Error | null
  time: number
}

export type DesignConversionResult = {
  manifest: Manifest['OctopusManifest']
  time: number
}

type ExportImage = { path: string; getImageData: () => Promise<Buffer> }

type ArtboardExport = {
  images: ExportImage[]
  artboard: ArtboardConversionResult
}

/**
 * Loading of .env file.
 */
createEnvironment()

export class OctopusFigConverter {
  private _id: string
  private _pkg: Promise<NormalizedReadResult | undefined>
  private _sourceDesign: SourceDesign
  private _octopusManifest: OctopusManifest

  static EXPORTERS = {
    LOCAL: LocalExporter,
    TEMP: TempExporter,
  }

  static READERS = {
    SOURCE: SourceFileReader,
  }

  static ARTBOARDS_QUEUE_NAME = 'artboards'
  static ARTBOARDS_QUEUE_PARALLELS = 5
  static PARTIAL_UPDATE_INTERVAL = 3000

  constructor(options: OctopusConverterOptions) {
    this._setupLogger(options?.logger)
    setSentry(
      createSentry({
        dsn: process.env.SENTRY_DSN,
        logger,
      })
    )

    this._id = options.designId || uuidv4()
    this._sourceDesign = options.sourceDesign
    this._octopusManifest = new OctopusManifest({ sourceDesign: options.sourceDesign, octopusConverter: this })
    this._pkg = readPackageUpAsync({ cwd: __dirname })
  }

  get sourceDesign(): SourceDesign {
    return this._sourceDesign
  }

  get octopusManifest(): OctopusManifest {
    return this._octopusManifest
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

  private async _convertArtboardByIdSafe(
    targetArtboardId: string
  ): Promise<{ value: Octopus['OctopusDocument'] | null; error: Error | null }> {
    try {
      const value = await new ArtboardConverter({ targetArtboardId, octopusConverter: this }).convert()
      return { value, error: null }
    } catch (error) {
      return { value: null, error }
    }
  }

  async convertArtboardById(targetArtboardId: string): Promise<ArtboardConversionResult> {
    const { time, result } = await benchmarkAsync(async () => this._convertArtboardByIdSafe(targetArtboardId))
    const { value, error } = result
    return { id: targetArtboardId, value, error, time }
  }

  private async _exportManifest(
    exporter: AbstractExporter | null,
    shouldEmit?: boolean
  ): Promise<Manifest['OctopusManifest']> {
    const { time, result: manifest } = await benchmarkAsync(() => this.octopusManifest.convert())
    await exporter?.exportManifest?.({ manifest, time }, shouldEmit)
    return manifest
  }

  private async _exportArtboard(exporter: AbstractExporter | null, artboard: SourceArtboard): Promise<ArtboardExport> {
    const images: ExportImage[] = [] // TODO

    const converted = await this.convertArtboardById(artboard.id)
    const artboardPath = await exporter?.exportArtboard?.(converted)
    this.octopusManifest.setExportedArtboard(artboard.id, {
      path: artboardPath,
      error: converted.error,
      time: converted.time,
    })
    return { images, artboard: converted }
  }

  private _initArtboardQueue(exporter: AbstractExporter | null) {
    return new Queue({
      name: OctopusFigConverter.ARTBOARDS_QUEUE_NAME,
      parallels: OctopusFigConverter.ARTBOARDS_QUEUE_PARALLELS,
      factory: async (artboards: SourceArtboard[]): Promise<SafeResult<ArtboardExport>[]> => {
        return Promise.all(
          artboards.map(async (artboard) => {
            return { value: await this._exportArtboard(exporter, artboard), error: null }
          })
        )
      },
    })
  }

  async convertDesign(options?: ConvertDesignOptions): Promise<ConvertDesignResult | null> {
    const exporter = isObject(options?.exporter) ? (options?.exporter as AbstractExporter) : null
    if (exporter == null) return null

    this.octopusManifest.registerBasePath(await exporter?.getBasePath?.())

    /** Pass whole SourceDesign entity into exporter - mainly for dev purposes */
    exporter?.exportSourceDesign?.(this._sourceDesign)

    /** Init artboards queue */
    const queue = this._initArtboardQueue(exporter)

    /** Init partial update */
    this._exportManifest(exporter)
    const manifestInterval = setInterval(
      async () => this._exportManifest(exporter),
      OctopusFigConverter.PARTIAL_UPDATE_INTERVAL
    )

    /** Enqueue all artboards */
    const allConverted = await Promise.all(this._sourceDesign.artboards.map((artboard) => queue.exec(artboard)))

    /** At this moment all artboards + dependencies should be converted and exported */

    /** Final trigger of manifest save */
    clearInterval(manifestInterval)
    const SHOULD_EMIT = true
    const manifest = await this._exportManifest(exporter, SHOULD_EMIT)

    /** Trigger finalizer */
    exporter?.finalizeExport?.()

    /** Return transient outputs */
    const images = [...new Set(allConverted.reduce((images, converted) => push(images, ...converted.images), []))]
    const artboards = allConverted.map((converted) => converted.artboard)

    return {
      manifest,
      artboards,
      images,
    }
  }
}
