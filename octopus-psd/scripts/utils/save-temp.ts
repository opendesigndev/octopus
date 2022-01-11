import { promises as fsp } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { getPkgLocation } from './pkg-location'

const getWorkDirTempLocation = async (dirId: string = uuidv4()) => {
  const workdir = path.join(await getPkgLocation(), 'workdir')
  const location = path.join(workdir, dirId)
  await fsp.mkdir(location, { recursive: true })
  return location
}

export const createTempSaver = async (location?: string) => {
  const sessionLocation = await getWorkDirTempLocation(location)
  return async (pathSuffix: string | null, body: string | Buffer) => {
    const suffix = typeof pathSuffix === 'string' ? pathSuffix : uuidv4()
    const fullPath = path.join(sessionLocation, suffix)
    await fsp.writeFile(fullPath, body)
    return fullPath
  }
}
