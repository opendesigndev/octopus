import dotenv from 'dotenv'

import { convertAll } from './utils/convert-all'
import { renderOctopus } from './utils/render-to-octopus'

dotenv.config()
;(async () => {
  const [octopusLocation] = await convertAll()

  if (!octopusLocation) {
    return
  }

  console.info(`Octopus: file://${octopusLocation}`)

  const shouldRender = process.env.CONVERT_RENDER === 'true'

  if (!shouldRender) {
    return
  }

  const renderPath = await renderOctopus(octopusLocation)

  console.info(`Image: file://${renderPath}`)
})()
