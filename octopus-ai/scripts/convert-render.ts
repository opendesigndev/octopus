import { convertAll } from "./utils/convert-all";
import {createPrivateData} from './utils/create-private-data'
import { renderOctopus } from "./utils/render-to-octopus";
import dotenv from 'dotenv'


dotenv.config();

(async () => {
   const [octopusLocation]= await convertAll()

   if(!octopusLocation){
     return
   }

   const shouldRender = process.env.CONVERT_RENDER === 'true'
   const shouldCreatePrivateData = process.env.SHOULD_CREATE_PRIVATE_DATA=== 'true'

   if(shouldCreatePrivateData){
     const privateDataLocation=await createPrivateData()
     console.info(`PrivateData: file://${privateDataLocation}`)
   }
  
   
   if(!shouldRender) {
     return
   }

  const renderPath = await renderOctopus(octopusLocation)
  
  console.info(`Octopus: file://${octopusLocation}`)
  console.info(`Image: file://${renderPath}`)

  })()
