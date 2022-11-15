import { S3Cacher } from './s3-cacher'
import { createLogger } from './services/logger'
import S3 from './services/s3'

import type { Logger, S3Service } from './types'
import type { IPathLocator } from './types/path-locator'

import type AWS from 'aws-sdk'

type S3CacherWithInstanceOptions = {
  logger?: Logger
  verbose?: boolean
  pathLocator: IPathLocator
  parallels?: {
    upload: number
    download: number
  }
  buckets: {
    upload: string
    download: string
  }
  acl?: string
  s3: AWS.S3
}
export type S3CacherOptions = S3CacherWithInstanceOptions | S3CacherWithCredentialsOptions

export type { IPathLocator }

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
    this._s3 = this._createS3(options)
    this._pathLocator = options.pathLocator
    this._parallels = options.parallels ?? { upload: 5, download: 5 }
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
      verbose: options.verbose,
      s3Plugin: this,
      acl: options.acl,
      buckets: options.buckets,
      s3: options.s3,
    })
  }
}
