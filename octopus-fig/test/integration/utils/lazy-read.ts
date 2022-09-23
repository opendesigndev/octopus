import fsp from 'fs/promises'

export function lazyRead<T>(path: string) {
  let data: T
  return async () => {
    if (data === undefined) {
      data = JSON.parse(await fsp.readFile(path, 'utf-8'))
    }
    return data
  }
}
