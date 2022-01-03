import { promises as fsp } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { getPkgLocation } from './pkg-location'


async function getWorkDirTempLocation() {
  const workdir = path.join(await getPkgLocation(), 'workdir')
  const location = path.join(workdir, uuidv4())
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