import { promises as fsp } from 'fs'

import AWS from 'aws-sdk'

import { fromEnv } from '../../utils/env'

import type { S3Plugin } from '../..'

type S3Options = {
  accessKeyId?: string
  secretAccessKey?: string
  region?: string
  verbose?: boolean
  s3Plugin: S3Plugin
}

type UploadOptions = {
  bucket?: string | null
  key: string
  body: string | Buffer
  ACL?: string
}

type UploadFileOptions = {
  bucket: string | null
  key: string
  filePath: string
  ACL?: string
}

type DownloadOptions = {
  bucket: string | null
  key: string
}

type Defaults = {
  accessKeyId: string
  secretAccessKey: string
  region: string
  ACL: string
  uploadBucket: string | null
  downloadBucket: string | null
}

export default class S3 {
  _s3: AWS.S3
  _verbose: boolean
  _accessKeyId: string
  _secretAccessKey: string
  _region: string
  _s3Plugin: S3Plugin

  static DEFAULTS: Defaults = {
    accessKeyId: fromEnv('AWS_ACCESS_KEY_ID', 'string'),
    secretAccessKey: fromEnv('AWS_SECRET_ACCESS_KEY', 'string'),
    region: fromEnv('AWS_S3_DESIGN_REGION', 'string', 'eu-west-1'),
    ACL: fromEnv('AWS_S3_ACL', 'string', 'public-read'),
    uploadBucket: fromEnv('AWS_S3_UPLOAD_BUCKET_NAME', 'string', fromEnv('AWS_S3_BUCKET_NAME', 'string', null)),
    downloadBucket: fromEnv('AWS_S3_DOWNLOAD_BUCKET_NAME', 'string', fromEnv('AWS_S3_BUCKET_NAME', 'string', null)),
  }

  constructor(options: S3Options) {
    const {
      accessKeyId = S3.DEFAULTS.accessKeyId,
      secretAccessKey = S3.DEFAULTS.secretAccessKey,
      region = S3.DEFAULTS.region,
      verbose = false,
      s3Plugin,
    } = Object(options) as S3Options

    this._s3Plugin = s3Plugin
    this._accessKeyId = accessKeyId
    this._secretAccessKey = secretAccessKey
    this._region = region

    this._verbose = verbose
    if (this._verbose) {
      this._s3Plugin.logger.info('S3 instance has been created')
    }
    this._s3 = new AWS.S3({ accessKeyId, secretAccessKey, region })
  }

  get options(): { accessKeyId: string; secretAccessKey: string; region: string; verbose: boolean } {
    return {
      accessKeyId: this._accessKeyId,
      secretAccessKey: this._secretAccessKey,
      region: this._region,
      verbose: this._verbose,
    }
  }

  upload({
    bucket = S3.DEFAULTS.uploadBucket,
    key,
    body,
    ACL = S3.DEFAULTS.ACL,
  }: UploadOptions): Promise<AWS.S3.ManagedUpload.SendData> {
    if (!bucket) {
      throw new Error('No bucket found at "AWS_S3_UPLOAD_BUCKET_NAME" or "AWS_S3_BUCKET_NAME" environment variables')
    }
    if (this._verbose) {
      this._s3Plugin.logger.info('S3 Upload', key)
    }
    return new Promise((resolve, reject) => {
      const params = { Bucket: bucket, Key: key, ACL, Body: body }
      this._s3.upload(params, (err: Error, data: AWS.S3.ManagedUpload.SendData) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  async uploadFile({
    bucket = S3.DEFAULTS.uploadBucket,
    key,
    filePath,
    ACL = S3.DEFAULTS.ACL,
  }: UploadFileOptions): Promise<AWS.S3.ManagedUpload.SendData> {
    const body = await fsp.readFile(filePath)
    return this.upload({ bucket, key, body, ACL })
  }

  async downloadRaw({ bucket = S3.DEFAULTS.downloadBucket, key }: DownloadOptions): Promise<AWS.S3.GetObjectOutput> {
    if (!bucket) {
      throw new Error('No bucket found at "AWS_S3_DOWNLOAD_BUCKET_NAME" or "AWS_S3_BUCKET_NAME" environment variables')
    }
    if (this._verbose) {
      this._s3Plugin.logger.info('S3 Download', key)
    }
    return new Promise((resolve, reject) => {
      const params = { Bucket: bucket, Key: key }
      this._s3.getObject(params, (err: Error, data: AWS.S3.GetObjectOutput) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  async download({ bucket = S3.DEFAULTS.downloadBucket, key }: DownloadOptions): Promise<string | Buffer> {
    return this.downloadRaw({ bucket, key }).then((data: AWS.S3.GetObjectOutput) => data.Body as string | Buffer)
  }

  get raw(): AWS.S3 {
    return this._s3
  }
}
