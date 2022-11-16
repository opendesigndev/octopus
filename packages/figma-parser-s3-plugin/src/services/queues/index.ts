import { Queue } from '../../utils/queue'

import type { S3Plugin } from '../..'
import type { S3ServiceDownloadOptions, S3ServiceUploadOptions } from '../../types'
import type AWS from 'aws-sdk'

type QueuesOptions = {
  s3Plugin: S3Plugin
}

export class Queues {
  _s3Plugin: S3Plugin
  _queues: {
    upload: Queue<S3ServiceUploadOptions, AWS.S3.ManagedUpload.SendData>
    download: Queue<S3ServiceDownloadOptions, string | Buffer>
  }

  constructor(options: QueuesOptions) {
    this._s3Plugin = options.s3Plugin
    this._queues = {
      upload: new Queue({
        name: 'Upload S3',
        parallels: this._s3Plugin._parallels.upload,
        factory: async (uploadOptions: S3ServiceUploadOptions[]) => {
          const [options] = uploadOptions
          const result = await this._s3Plugin._s3.upload(options)
          return [Queue.safeValue(result)]
        },
      }),
      download: new Queue({
        name: 'Download S3',
        parallels: this._s3Plugin._parallels.download,
        factory: async (downloadOptions: S3ServiceDownloadOptions[]) => {
          const [options] = downloadOptions
          const result = await this._s3Plugin._s3.download(options)
          return [Queue.safeValue(result)]
        },
      }),
    }
  }
}
