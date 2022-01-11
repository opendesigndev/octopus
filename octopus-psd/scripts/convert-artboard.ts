// import chalk from 'chalk'
// import { performance } from 'perf_hooks'

import { createSourceTree } from './utils/create-source-tree'

// import SourceDesign from '../src/entities/source-design'
import { OctopusPSDConverter } from '../src'
// import { createTempSaver } from './utils/save-temp'
// import { stringify } from './utils/json-stringify'
import { SourceArtboard } from '../src/entities/source-artboard'

const convertArtboard = async () => {
  const [filename] = process.argv.slice(2)
  console.info(`Start converting file: ${filename}`)
  if (filename === undefined) {
    return console.error('Missing argument (path to .psd file)')
  }
  const sourceArtboard = await createSourceTree(filename)
  console.info(`Photoshop file converted to source file.`)

  const converter = new OctopusPSDConverter()
  const octopus = await converter.convertArtboard({ sourceArtboard })

  console.info(`octopus`, octopus)

  // const saver = await createTempSaver()

  //   sourceDesign.artboards.forEach(async (artboard) => {
  //     const timeStart = performance.now()
  //     const octopus = await convert(converter, artboard, sourceDesign)
  //     const time = performance.now() - timeStart
  //     const sourceLocation = await saver(`source-${artboard.meta.id}.json`, stringify(artboard.raw))
  //     const octopusLocation = await saver(`octopus-${artboard.meta.id}.json`, stringify(octopus))
  //     console.log(`${octopus ? '✅' : '❌'} ${chalk.yellow(artboard.meta.name)} (${Math.round(time)}ms) ${chalk.grey(
  //       `(${artboard.meta.id})`
  //     )}
  //       Source: file://${sourceLocation}
  //       Octopus: file://${octopusLocation}
  //     `)
  //   })
}

convertArtboard()
