import { readdir } from 'fs/promises'

import { convert } from './convert-debug.js'

const dirPath = './sample'
export async function convertBulk() {
  const fileNames = await readdir(dirPath)
  const filtered = fileNames.filter((name) => name.includes('psd'))

  for (const fileName of filtered) {
    const path = `${dirPath}/${fileName}`
    await convert([path])
  }
}

convertBulk()
