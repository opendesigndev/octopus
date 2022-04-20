//@todo file copy from octopus-xd
import { promises as fsp } from 'fs'
import path from 'path'

import { v4 as uuidv4 } from 'uuid'

import { getPkgLocation } from './pkg-location'

type CreateTempSaverOptions = {
  id?: string
}

async function getWorkDirTempLocation(id: string | void) {
  const workdir = path.join(await getPkgLocation(), 'workdir')
  const location = path.join(workdir, typeof id === 'string' ? id : uuidv4())
  await fsp.mkdir(location, { recursive: true })
  return location
}

export async function createTempSaver(
  options: CreateTempSaverOptions
): Promise<(pathSuffix: string | null, body: string | Buffer) => Promise<string>> {
  const sessionLocation = await getWorkDirTempLocation(options.id)

  return async (pathSuffix: string | null, body: string | Buffer): Promise<string> => {
    const suffix = typeof pathSuffix === 'string' ? pathSuffix : uuidv4()
    const fullPath = path.join(sessionLocation, suffix)
    await fsp.writeFile(fullPath, body)
    return fullPath
  }
}
