import dotenv from 'dotenv'

import { convertDebug } from './utils/convert-debug'
import { renderOctopus } from './utils/render-to-octopus'

dotenv.config()
;(async () => {
  const octopusLocation = await convertDebug()

  if (!octopusLocation) {
    return
  }

  const shouldRender = process.env.CONVERT_RENDER === 'true'

  if (!shouldRender) {
    return
  }

  const renderPath = await renderOctopus(octopusLocation)

  console.info(`Image: file://${renderPath}`)
})()
