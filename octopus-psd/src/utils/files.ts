import type { Dirent } from 'fs'
import { readdir } from 'fs/promises'
import { logWarn } from '../services/instances/misc'

export async function getFilesFromDir(dirPath: string): Promise<Dirent[] | null> {
  try {
    const imagesResults = await readdir(dirPath, { withFileTypes: true })
    return imagesResults.filter((image) => !image.isDirectory())
  } catch (e) {
    logWarn(`Reading directory '${dirPath}' was not successful`)
    return null
  }
}
