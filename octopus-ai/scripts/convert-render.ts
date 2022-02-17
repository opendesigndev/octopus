import { convertAll } from './utils/convert-all'
import { renderOctopus } from './utils/render-to-octopus'
import dotenv from 'dotenv'

dotenv.config()
;(async () => {
  const [octopusLocation] = await convertAll()

  if (!octopusLocation) {
    return
  }

  const shouldRender = process.env.CONVERT_RENDER === 'true'

  if (!shouldRender) {
    return
  }

  const renderPath = await renderOctopus(octopusLocation)

  console.info(`Octopus: file://${octopusLocation}`)
  console.info(`Image: file://${renderPath}`)
})()
