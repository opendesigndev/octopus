import type { Dirent } from 'fs'
import { readdir, stat } from 'fs/promises'
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

export async function isDirectory(path: string): Promise<boolean> {
  const stats = await stat(path)
  return stats.isDirectory()
}
