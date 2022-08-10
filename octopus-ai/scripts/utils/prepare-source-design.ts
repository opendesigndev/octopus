import SourceDesign from '../../src/entities/source/source-design.js'
import { getSourceJSON } from './get-source-json.js'

export async function prepareSourceDesign(): Promise<SourceDesign> {
  const sourceJSON = await getSourceJSON()
  return SourceDesign.fromRawSource(sourceJSON)
}
