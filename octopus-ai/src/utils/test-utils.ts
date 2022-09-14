import fsp from 'fs/promises'

import dotenv from 'dotenv'

dotenv.config()

export function getCommandLineArgs(): { isUpdate: boolean; selectedTest?: string } {
  const updateIndex = process.argv.indexOf('update')

  if (updateIndex !== 2 && updateIndex !== 3) {
    return { isUpdate: false, selectedTest: process.argv[2] }
  }

  if (updateIndex === 3) {
    return { isUpdate: true, selectedTest: process.argv[2] }
  }

  return { isUpdate: true, selectedTest: process.argv[3] }
}

export function lazyRead<T>(path: string) {
  let loaded = false
  let data: T
  return async () => {
    if (!loaded) {
      data = JSON.parse(await fsp.readFile(path, 'utf-8'))
      loaded = true
    }
    return data
  }
}
