import fsp from 'fs/promises'

import dotenv from 'dotenv'

import { AIFileReader } from '../../src/services/conversion/ai-file-reader'

import type { SourceDesign } from '../../src/entities/source/source-design'

dotenv.config()

export function getCommandLineArgs(): { selectedTest: string | undefined } {
  return { selectedTest: process.argv[2] }
}

export function lazyRead<T>(path: string) {
  let data: T
  return async () => {
    if (data === undefined) {
      data = JSON.parse(await fsp.readFile(path, 'utf-8'))
    }
    return data
  }
}

export async function getSourceDesign(designPath: string): Promise<SourceDesign> {
  const fileReader = new AIFileReader({ path: designPath })
  const sourceDesign = await fileReader.sourceDesign
  await fileReader.cleanup()

  return sourceDesign
}
