import dotenv from 'dotenv'

import { PSDFileReader } from '../../../src/services/readers/psd-file-reader.js'

import type { SourceDesign } from '../../../src/entities/source/source-design.js'

dotenv.config()

export async function getSourceDesign(designPath: string): Promise<SourceDesign | null> {
  const fileReader = new PSDFileReader({ path: designPath })
  const sourceDesign = await fileReader.sourceDesign
  await fileReader.cleanup()

  return sourceDesign
}
