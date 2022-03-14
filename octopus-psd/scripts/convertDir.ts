import { convertDesign } from './utils/convert-design'
import { readdir } from 'fs/promises'
import path from 'path'

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

const [filename] = process.argv.slice(2)
convertDir(filename)
