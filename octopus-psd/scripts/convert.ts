import { convertDesign } from './utils/convert-design'
import { readdir } from 'fs/promises'
import path from 'path'
import { isDirectory } from '../src/utils/files'

async function convertDir(dirPath: string) {
  try {
    const files = await readdir(dirPath, { withFileTypes: true })
    for (const file of files) {
      if (file.isDirectory()) continue
      if (!/\.psd$/i.test(file.name)) continue
      await convertDesign(path.join(dirPath, file.name))
    }
  } catch {
    console.info(`Reading directory '${dirPath}' was not successful`)
  }
}

async function convert(path: string) {
  if (await isDirectory(path)) {
    convertDir(path)
  } else {
    convertDesign(path)
  }
}

const [location] = process.argv.slice(2)
convert(location)
