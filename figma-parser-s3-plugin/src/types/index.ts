import type * as AWS from 'aws-sdk'

/* eslint-disable @typescript-eslint/ban-types */
export interface Logger {
  fatal: Function
  error: Function
  warn: Function
  info: Function
  debug: Function
  trace: Function
  silent: Function
}

export type S3ServiceDownloadOptions = {
  key: string
}

export type S3ServiceUploadOptions = {
  key: string
  body: string | Buffer
}

export type S3Service = {
  raw: {}
  download: (options: S3ServiceDownloadOptions) => Promise<Buffer | string>
  upload: (options: S3ServiceUploadOptions) => Promise<AWS.S3.ManagedUpload.SendData>
}
