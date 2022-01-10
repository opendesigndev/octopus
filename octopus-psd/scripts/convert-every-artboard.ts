// import chalk from 'chalk'
// import { performance } from 'perf_hooks'

// import createSourceTree from './utils/create-source-tree'
// import SourceDesign from '../src/entities/source-design'
// import OctopusPSDConverter from '../src'
// import { createTempSaver } from './utils/save-temp'
// import { stringify } from './utils/json-stringify'
// import SourceArtboard from '../src/entities/source-artboard'

// /** @TODO move scripts out of src? */

// async function convert(converter: OctopusPSDConverter, artboard: SourceArtboard, sourceDesign: SourceDesign) {
//   try {
//     return await converter.convertArtboardById({
//       targetArtboardId: artboard.meta.id,
//       sourceDesign,
//     })
//   } catch (e) {
//     return null
//   }
// }

// ;(async () => {
//   const [filename] = process.argv.slice(2)
//   const sourceTree = await createSourceTree(filename)
//   const sourceDesign = SourceDesign.fromUnzippedBuffers(sourceTree)
//   const converter = new OctopusPSDConverter()
//   const saver = await createTempSaver()

//   const manifestLocation = await saver('manifest.json', stringify(sourceDesign.manifest.raw))
//   const interactionsLocation = await saver('interactions.json', stringify(sourceDesign.interactions.raw))
//   const resourcesLocation = await saver('resources.json', stringify(sourceDesign.resources.raw))

//   console.log(`${chalk.yellow('Manifest: ')}
//     file://${manifestLocation}
//   `)
//   console.log(`${chalk.yellow('Interactions: ')}
//     file://${interactionsLocation}
//   `)
//   console.log(`${chalk.yellow('Resources: ')}
//     file://${resourcesLocation}
//   `)

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
// })()
