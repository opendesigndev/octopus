import { S3Cacher } from './s3-cacher'
import { createLogger } from './services/logger'
import S3 from './services/s3'

import type { Logger, S3Service } from './types'
import type { IPathLocator } from './types/path-locator'

type S3CacherWithInstanceOptions = {
  logger?: Logger
  s3service: S3Service
  verbose?: boolean
  pathLocator: IPathLocator
  uploadParallels: number
  downloadParallels: number
}
type S3CacherWithCredentialsOptions = {
  logger?: Logger
  accessKeyId: string
  secretAccessKey: string
  region: string
  verbose?: boolean
  pathLocator: IPathLocator
  uploadParallels: number
  downloadParallels: number
  uploadBucket?: string
  downloadBucket?: string
  acl?: string
}
export type S3CacherOptions = S3CacherWithInstanceOptions | S3CacherWithCredentialsOptions

export type { IPathLocator }

export class S3Plugin {
  _logger: Logger
  _s3: S3Service
  _cacher: S3Cacher
  _pathLocator: IPathLocator
  _parallels: {
    upload: number
    download: number
  }

  constructor(options: S3CacherOptions) {
    this._logger = options.logger ?? this._createLogger()
    this._s3 = 's3service' in options ? options.s3service : this._createS3(options)
    this._pathLocator = options.pathLocator
    this._parallels = {
      upload: options.uploadParallels ?? 5,
      download: options.downloadParallels ?? 5,
    }
    this._cacher = new S3Cacher({
      s3Plugin: this,
    })
  }

  get cacher() {
    return this._cacher
  }

  get logger(): Logger {
    return this._logger
  }

  private _createLogger() {
    return createLogger()
  }

  private _createS3(options: S3CacherWithCredentialsOptions) {
    return new S3({
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
      region: options.region,
      verbose: options.verbose,
      s3Plugin: this,
      uploadBucket: options.uploadBucket,
      downloadBucket: options.downloadBucket,
      acl: options.acl,
    })
  }
}
