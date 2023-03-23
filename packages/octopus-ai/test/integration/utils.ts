import fsp from 'fs/promises'

import dotenv from 'dotenv'

import type { SourceDesign } from '../../src/entities/source/source-design.js'
import type { AIFileReaderCommon } from '../../src/services/readers/ai-file-reader-common.js'

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

export async function getSourceDesign(fileReader: AIFileReaderCommon): Promise<SourceDesign> {
  const sourceDesign = await fileReader.getSourceDesign()

  return sourceDesign
}
