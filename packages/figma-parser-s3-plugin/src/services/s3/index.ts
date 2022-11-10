import { promises as fsp } from 'fs'

import AWS from 'aws-sdk'

import type { S3Plugin } from '../..'

type S3Options = {
  accessKeyId: string
  secretAccessKey: string
  region: string
  verbose?: boolean
  acl?: string
  uploadBucket?: string
  downloadBucket?: string
  s3Plugin: S3Plugin
}

type UploadOptions = {
  bucket?: string | null
  key: string
  body: string | Buffer
  ACL?: string
}

type UploadFileOptions = {
  bucket?: string
  key: string
  filePath: string
  ACL?: string
}

type DownloadOptions = {
  bucket?: string
  key: string
}

export default class S3 {
  _s3: AWS.S3
  _verbose: boolean
  _accessKeyId: string
  _secretAccessKey: string
  _region: string
  _s3Plugin: S3Plugin
  _acl?: string
  _uploadBucket?: string
  _downloadBucket?: string

  constructor(options: S3Options) {
    const {
      accessKeyId,
      secretAccessKey,
      region = 'eu-west-1',
      verbose = false,
      acl = 'public-read',
      uploadBucket,
      downloadBucket,
      s3Plugin,
    } = Object(options) as S3Options

    this._s3Plugin = s3Plugin
    this._accessKeyId = accessKeyId
    this._secretAccessKey = secretAccessKey
    this._region = region
    this._acl = acl
    this._uploadBucket = uploadBucket
    this._downloadBucket = downloadBucket

    this._verbose = verbose
    if (this._verbose) {
      this._s3Plugin.logger.info('S3 instance has been created')
    }
    this._s3 = new AWS.S3({ accessKeyId, secretAccessKey, region })
  }

  get options(): Omit<S3Options, 's3Plugin'> {
    return {
      accessKeyId: this._accessKeyId,
      secretAccessKey: this._secretAccessKey,
      region: this._region,
      verbose: this._verbose,
      acl: this._acl,
      uploadBucket: this._uploadBucket,
      downloadBucket: this._downloadBucket,
    }
  }

  upload({
    bucket = this._uploadBucket,
    key,
    body,
    ACL = this._acl,
  }: UploadOptions): Promise<AWS.S3.ManagedUpload.SendData> {
    if (!bucket) {
      throw new Error('Upload bucket have not been provided!')
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
    bucket = this._uploadBucket,
    key,
    filePath,
    ACL = this._acl,
  }: UploadFileOptions): Promise<AWS.S3.ManagedUpload.SendData> {
    const body = await fsp.readFile(filePath)
    return this.upload({ bucket, key, body, ACL })
  }

  async downloadRaw({ bucket = this._downloadBucket, key }: DownloadOptions): Promise<AWS.S3.GetObjectOutput> {
    if (!bucket) {
      throw new Error('Download bucket have not been provided!')
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

  async download({ bucket = this._downloadBucket, key }: DownloadOptions): Promise<string | Buffer> {
    return this.downloadRaw({ bucket, key }).then((data: AWS.S3.GetObjectOutput) => data.Body as string | Buffer)
  }

  get raw(): AWS.S3 {
    return this._s3
  }
}
