import SourceDesign from '../../src/entities/source/source-design'
import { getSourceJSON } from './get-source-json'

export async function prepareSourceDesign(): Promise<SourceDesign> {
  const sourceJSON = await getSourceJSON()
  return SourceDesign.fromRawSource(sourceJSON)
}
