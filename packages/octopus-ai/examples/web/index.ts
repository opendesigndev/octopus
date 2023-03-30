import * as OctopusAI from '../../src/index-web.js'

window.addEventListener('DOMContentLoaded', async () => {
  const { createConverter, AIFileReader, WebExporter } = OctopusAI
  console.log('OctopusAI:', OctopusAI)

  try {
    const response = await fetch('./assets/inside-photo.ai')
    const file = new Uint8Array(await response.arrayBuffer())
    const converter = createConverter()
    const reader = new AIFileReader({ file })
    const sourceDesign = await reader.getSourceDesign()

    if (sourceDesign === null) {
      console.error('Creating SourceDesign Failed')
      return
    }

    const exporter = new WebExporter()
    const result = await converter.convertDesign({ sourceDesign, exporter })

    console.info('Result:', result)
  } catch (err) {
    console.error('Some error happened:', err)
  }
})
