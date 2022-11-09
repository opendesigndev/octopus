import { S3Cacher } from './s3-cacher'
import { createLogger } from './services/logger'
import S3 from './services/s3'

import type { PathLocator } from './services/path-locator/path-locator.iface'
import type { Logger, S3Service } from './types'

export type S3CacherOptions = {
  logger?: Logger
  s3service?: S3Service

  accessKeyId?: string
  secretAccessKey?: string
  region?: string
  verbose?: boolean

  pathLocator: PathLocator

  // outputDir: string
  // cacheMapFile: string
  // sourcesDir: string
  // artifactsDir: string

  uploadParallels: number
  downloadParallels: number
}

export class S3Plugin {
  _logger: Logger
  _s3: S3Service
  _cacher: S3Cacher
  _pathLocator: PathLocator
  _parallels: {
    upload: number
    download: number
  }

  // _outputDir: string
  // _cacheMapFile: string
  // _sourcesDir: string
  // _artifactsDir: string

  constructor(options: S3CacherOptions) {
    this._logger = options.logger ?? this._createLogger()
    this._s3 = options.s3service ?? this._createS3(options)
    this._pathLocator = options.pathLocator
    this._parallels = {
      upload: options.uploadParallels ?? 5,
      download: options.downloadParallels ?? 5,
    }
    this._cacher = new S3Cacher({
      s3Plugin: this,
    })

    // this._outputDir = options.outputDir
    // this._cacheMapFile = options.cacheMapFile
    // this._sourcesDir = options.sourcesDir
    // this._artifactsDir = options.artifactsDir
  }

  get cacher() {
    return this._cacher
  }

  // get artifactsDir(): string {
  //   return this._artifactsDir
  // }

  // get sourcesDir(): string {
  //   return this._sourcesDir
  // }

  // get outputDir(): string {
  //   return this._outputDir
  // }

  // get cacheMapFile(): string {
  //   return this._cacheMapFile
  // }

  get logger(): Logger {
    return this._logger
  }

  private _createLogger() {
    return createLogger()
  }

  private _createS3(options: S3CacherOptions) {
    return new S3({
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
      region: options.region,
      verbose: options.verbose,
      s3Plugin: this,
    })
  }
}
