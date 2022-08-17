import { copyFile as cp, mkdir, readdir, readFile, stat, writeFile } from 'fs/promises'

import { logger } from '../services'

import type { Dirent } from 'fs'

export async function getFilesFromDir(dirPath: string): Promise<Dirent[] | null> {
  try {
    const imagesResults = await readdir(dirPath, { withFileTypes: true })
    return imagesResults.filter((image) => !image.isDirectory())
  } catch (e) {
    logger?.warn(`Reading directory '${dirPath}' was not successful`)
    return null
  }
}

export async function parseJsonFromFile<T>(path: string): Promise<T | null> {
  try {
    const file = await readFile(path, { encoding: 'utf8' })
    return JSON.parse(file)
  } catch (e) {
    logger?.warn(`Parsing json from file '${path}' failed`)
    return null
  }
}

export async function isDirectory(path: string): Promise<boolean> {
  const stats = await stat(path)
  return stats.isDirectory()
}

export async function saveFile(path: string, body: string | Buffer): Promise<string> {
  try {
    await writeFile(path, body)
  } catch (error) {
    logger?.warn(`Saving file '${path}' failed`, { error })
  }
  return path
}

export async function makeDir(path: string): Promise<string> {
  try {
    await mkdir(path, { recursive: true })
  } catch (e) {
    logger?.warn(`Making directory '${path}' was not successful`)
  }
  return path
}

export async function copyFile(src: string, dest: string): Promise<string> {
  try {
    await cp(src, dest)
  } catch (e) {
    logger?.warn(`Copying file from '${src}' to '${dest}' failed`)
  }
  return dest
}
