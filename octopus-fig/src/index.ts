import { benchmarkAsync } from '@avocode/octopus-common/dist/utils/benchmark'
import { isObject } from '@avocode/octopus-common/dist/utils/common'
import PQueue from 'p-queue'
import readPackageUpAsync from 'read-pkg-up'
import { v4 as uuidv4 } from 'uuid'

import { OctopusManifest } from './entities/octopus/octopus-manifest'
import { SourceArtboard } from './entities/source/source-artboard'
import { SourceDesign } from './entities/source/source-design'
import { ArtboardConverter } from './services/conversion/artboard-converter'
import { LocalExporter } from './services/exporters/local-exporter'
import { TempExporter } from './services/exporters/temp-exporter'
import { ENV } from './services/general/environment'
import { createSentry } from './services/general/sentry'
import { logger, set as setLogger } from './services/instances/logger'
import { set as setSentry } from './services/instances/sentry'
import { SourceApiReader } from './services/readers/source-api-reader'

import type { SourceImage } from './entities/source/source-design'
import type { AbstractExporter } from './services/exporters/abstract-exporter'
import type { Logger } from './typings'
import type { Manifest } from './typings/manifest'
import type { Octopus } from './typings/octopus'
import type { RawDesign } from './typings/raw/design'
import type { RawLayerFrame } from './typings/raw/layer'
import type { Design, ResolvedDesign, ResolvedFrame } from '@avocode/figma-parser/lib/src/index-node'
import type { NormalizedReadResult } from 'read-pkg-up'

export { LocalExporter, TempExporter }
export { SourceApiReader }

type ConvertDesignOptions = {
  exporter?: AbstractExporter
}

type OctopusConverterOptions = {
  designPromise: Promise<Design | null>
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

export class OctopusFigConverter {
  private _id: string
  private _pkg: Promise<NormalizedReadResult | undefined>
  private _designPromise: Promise<Design | null>
  private _octopusManifest: OctopusManifest | undefined

  static EXPORTERS = {
    LOCAL: LocalExporter,
    TEMP: TempExporter,
  }

  static READERS = {
    API: SourceApiReader,
  }

  static QUEUE_PARALLELS = 5
  static PARTIAL_UPDATE_INTERVAL = 3000

  constructor(options: OctopusConverterOptions) {
    this._setupLogger(options?.logger)
    setSentry(
      createSentry({
        dsn: ENV.SENTRY,
        logger,
      })
    )

    this._id = options.designId || uuidv4()
    this._designPromise = options.designPromise
    this._pkg = readPackageUpAsync({ cwd: __dirname })
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

  private async _convertArtboardSafe(
    artboard: SourceArtboard
  ): Promise<{ value: Octopus['OctopusDocument'] | null; error: Error | null }> {
    try {
      const version = await this.pkgVersion
      const value = await new ArtboardConverter({ artboard, version }).convert()
      return { value, error: null }
    } catch (error) {
      return { value: null, error }
    }
  }

  async convertArtboard(artboard: SourceArtboard): Promise<ArtboardConversionResult> {
    const { time, result } = await benchmarkAsync(async () => this._convertArtboardSafe(artboard))
    const { value, error } = result
    return { id: artboard.id, value, error, time }
  }

  private async _exportManifest(
    exporter: AbstractExporter | null,
    shouldEmit?: boolean
  ): Promise<Manifest['OctopusManifest'] | undefined> {
    const octopusManifest = this._octopusManifest
    if (!octopusManifest) return undefined
    const { time, result: manifest } = await benchmarkAsync(() => octopusManifest.convert())
    await exporter?.exportManifest?.({ manifest, time }, shouldEmit)
    return manifest
  }

  private async _exportArtboard(exporter: AbstractExporter | null, artboard: SourceArtboard): Promise<ArtboardExport> {
    const images: ExportImage[] = [] // TODO
    const converted = await this.convertArtboard(artboard)
    const artboardPath = await exporter?.exportArtboard?.(converted)
    this._octopusManifest?.setExportedArtboard(artboard.id, {
      path: artboardPath,
      error: converted.error,
      time: converted.time,
    })
    return { images, artboard: converted }
  }

  async convertDesign(options?: ConvertDesignOptions): Promise<boolean | null> {
    const exporter = isObject(options?.exporter) ? (options?.exporter as AbstractExporter) : null
    if (exporter == null) {
      logger.error('No Exporter provided')
      return null
    }

    /** Init artboards queue */
    const queue = new PQueue({ concurrency: OctopusFigConverter.QUEUE_PARALLELS })

    const design = await this._designPromise
    if (design === null) {
      logger.error('Creating Design Failed')
      return null
    }

    design.on('ready:design', async (design: ResolvedDesign) => {
      const designId = design.designId
      const raw = design.design as unknown as RawDesign // TODO
      const images = [] as SourceImage[] // TODO
      const sourceDesign = new SourceDesign({ designId, images, raw })

      const octopusManifest = new OctopusManifest({ sourceDesign, octopusConverter: this })
      this._octopusManifest = octopusManifest
      octopusManifest.registerBasePath(await exporter?.getBasePath?.())

      exporter?.exportSourceDesign?.(sourceDesign)

      /** Init partial update */
      this._exportManifest(exporter)
      const manifestInterval = setInterval(
        async () => this._exportManifest(exporter),
        OctopusFigConverter.PARTIAL_UPDATE_INTERVAL
      )

      /** Wait till all artboards + dependencies are processed */
      await design.content
      queue.add(async () => 'last')
      await queue.onIdle()

      /** At this moment all artboards + dependencies should be converted and exported */

      /** Final trigger of manifest save */
      clearInterval(manifestInterval)
      const SHOULD_EMIT = true
      await this._exportManifest(exporter, SHOULD_EMIT)

      /** Trigger finalizer */
      exporter?.finalizeExport?.()
    })

    design.on('ready:artboard', async (frame: ResolvedFrame) => {
      const rawArtboard = frame.node.document as RawLayerFrame
      const sourceArtboard = new SourceArtboard(rawArtboard)
      queue.add(async () => await this._exportArtboard(exporter, sourceArtboard))
    })

    return true
  }
}
