import * as OctopusAI from '../../src/index-web.js'

window.addEventListener('DOMContentLoaded', async () => {
  const { createConverter, AIFileReaderWeb, WebExporter } = OctopusAI
  console.log('OctopusAI:', OctopusAI)
  const readerOptions = {
    path: './simple.ai',
  }

  try {
    const converter = createConverter()
    const reader = new AIFileReaderWeb(readerOptions)
    const sourceDesign = await reader.getSourceDesign()
    if (sourceDesign === null) {
      console.error('Creating SourceDesign Failed')
      return
    }
    const exporter = new WebExporter()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = await converter.convertDesign({ sourceDesign, exporter })

    console.info('Result:', result)
  } catch (err) {
    console.error('Some error happened:', err)
  }
})