import { getSourceJSON } from "./get-source-json"

export async function prepareSourceDesign (){
   const sourceJSON = await getSourceJSON()
   console.log('___sourceJson',sourceJSON)
   const artboards =  sourceJSON.Root.Pages.Kids.map((artboard:any)=>artboard)
   console.log('____artboards',artboards)
}