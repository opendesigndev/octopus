import { unzip as fflateUnzip } from 'fflate'

import type { UnzipFileFilter, Unzipped } from 'fflate'

type UnzipOptions = {
  file: Uint8Array
  filter?: UnzipFileFilter
}

export async function unzip(options: UnzipOptions): Promise<Unzipped> {
  return new Promise((resolve, reject) => {
    const filter = typeof options.filter === 'function' ? options.filter : () => true
    fflateUnzip(options.file, { filter }, (err, files) => {
      err ? reject(err) : resolve(files)
    })
  })
}

export async function unzipArray(options: UnzipOptions): Promise<{ path: string; content: Uint8Array }[]> {
  const results = await unzip(options)
  return Object.keys(results).map((key) => {
    return {
      path: key,
      content: results[key],
    }
  })
}
