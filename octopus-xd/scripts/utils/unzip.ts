import { promises as fsp } from 'fs'
import fflate from 'fflate'

import type { UnzipFileFilter, Unzipped } from 'fflate'


type UnzipOptions = {
  filename: string,
  filter?: UnzipFileFilter
}

export async function unzip(options: UnzipOptions): Promise<Unzipped> {
  const file = await fsp.readFile(options.filename)
  return new Promise((resolve, reject) => {
    const filter = typeof options.filter === 'function' ? options.filter : () => true
    fflate.unzip(file, { filter }, (err, files) => {
      err ? reject(err) : resolve(files)
    })
  })
}

export async function unzipArray(options: UnzipOptions) {
  const results = await unzip(options)
  return Object.keys(results).map(key => {
    return {
      path: key,
      content: results[key]
    }
  })
}