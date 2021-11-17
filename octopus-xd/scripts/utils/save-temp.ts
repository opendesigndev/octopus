import { promises as fsp } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

export const WORK_DIR = path.join(__dirname, '..', '..', 'workdir')


async function getWorkDirTempLocation() {
  const location = path.join(WORK_DIR, uuidv4())
  await fsp.mkdir(location, { recursive: true })
  return location
}

export async function createTempSaver() {
  const sessionLocation = await getWorkDirTempLocation()
  return async (pathSuffix: string | null, body: string | Buffer) => {
    const suffix = typeof pathSuffix === 'string' ? pathSuffix : uuidv4()
    const fullPath = path.join(sessionLocation, suffix)
    await fsp.writeFile(fullPath, body)
    return fullPath
  }
}