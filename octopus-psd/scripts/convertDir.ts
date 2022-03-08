import { convertDesign } from './utils/convert-design'
import { readdir } from 'fs/promises'
import path from 'path'

async function convertDir(dirPath: string) {
  try {
    const files = await readdir(dirPath, { withFileTypes: true })
    for (const file of files) {
      if (file.isDirectory()) continue
      const fileName = file.name
      const ext = path.extname(fileName)
      if (ext.toLocaleLowerCase() !== '.psd') continue

      convertDesign(path.join(dirPath, fileName))
    }
  } catch {
    console.info(`Reading directory '${dirPath}' was not successful`)
  }
}

const [filename] = process.argv.slice(2)
convertDir(filename)
