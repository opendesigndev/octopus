import { getSourceJSON } from "./get-source-json"
import SourceDesign from "../../src/entities-source/source-design"

export async function prepareSourceDesign (){
   const sourceJSON = await getSourceJSON()
   return SourceDesign.fromRawSource(sourceJSON)
}