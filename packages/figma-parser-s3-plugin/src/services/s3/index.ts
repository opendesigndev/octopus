import { promises as fsp } from 'fs'

import type { S3Plugin } from '../..'
import type AWS from 'aws-sdk'

type S3Options = {
  verbose?: boolean
  buckets?: {
    upload: string
    download: string
  }
  acl?: string
  s3Plugin: S3Plugin
  s3: AWS.S3
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
  _acl: string
  _s3Plugin: S3Plugin
  _buckets?: {
    upload: string
    download: string
  }

  constructor(options: S3Options) {
    const { verbose = false, buckets, acl = 'public-read', s3Plugin, s3 } = Object(options) as S3Options

    this._s3Plugin = s3Plugin
    this._buckets = buckets
    this._acl = acl
    this._s3 = s3
    this._verbose = verbose
    if (this._verbose) {
      this._s3Plugin.logger.info('S3 instance has been created')
    }
  }

  upload({
    bucket = this._buckets?.upload,
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
    bucket = this._buckets?.upload,
    key,
    filePath,
    ACL = this._acl,
  }: UploadFileOptions): Promise<AWS.S3.ManagedUpload.SendData> {
    const body = await fsp.readFile(filePath)
    return this.upload({ bucket, key, body, ACL })
  }

  async downloadRaw({ bucket = this._buckets?.download, key }: DownloadOptions): Promise<AWS.S3.GetObjectOutput> {
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

  async download({ bucket = this._buckets?.download, key }: DownloadOptions): Promise<string | Buffer> {
    return this.downloadRaw({ bucket, key }).then((data: AWS.S3.GetObjectOutput) => data.Body as string | Buffer)
  }

  get raw(): AWS.S3 {
    return this._s3
  }
}
