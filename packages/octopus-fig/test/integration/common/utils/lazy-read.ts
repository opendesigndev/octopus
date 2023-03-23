import { parseJsonFromFile } from '../../../../src/utils/files.js'

export function lazyRead<T>(path: string) {
  let data: T | null
  return async () => {
    if (data === undefined) {
      data = await parseJsonFromFile(path)
    }
    return data
  }
}
