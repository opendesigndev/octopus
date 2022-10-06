import dotenv from 'dotenv'

import { PSDFileReader } from '../../../src/services/readers/psd-file-reader'

import type { SourceDesign } from '../../../src/entities/source/source-design'

dotenv.config()

export async function getSourceDesign(designPath: string): Promise<SourceDesign | null> {
  const fileReader = new PSDFileReader({ path: designPath })
  const sourceDesign = await fileReader.sourceDesign
  await fileReader.cleanup()

  return sourceDesign
}
