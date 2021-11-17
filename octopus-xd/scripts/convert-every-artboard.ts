import chalk from 'chalk'

import createSourceTree from './utils/create-source-tree'
import SourceDesign from '../src/entities/source-design'
import OctopusXDConverter from '../src'
import { createTempSaver } from './utils/save-temp'
import { stringify } from './utils/json-stringify'



;(async () => {
  const [ filename ] = process.argv.slice(2)
  const sourceTree = await createSourceTree(filename)
  const sourceDesign = SourceDesign.fromUnzippedBuffers(sourceTree)
  const converter = new OctopusXDConverter()
  const saver = await createTempSaver()

  const manifestLocation = await saver(
    'manifest.json',
    stringify(sourceDesign.manifest.raw)
  )
  const interactionsLocation = await saver(
    'interactions.json',
    stringify(sourceDesign.interactions.raw)
  )
  const resourcesLocation = await saver(
    'resources.json',
    stringify(sourceDesign.resources.raw)
  )

  console.log(`${chalk.yellow('Manifest: ')}
    file://${ manifestLocation }
  `)
  console.log(`${chalk.yellow('Interactions: ')}
    file://${ interactionsLocation }
  `)
  console.log(`${chalk.yellow('Resources: ')}
    file://${ resourcesLocation }
  `)

  sourceDesign.artboards.forEach(async artboard => {
    const octopus = await converter.convertArtboardById({
      targetArtboardId: artboard.meta.id,
      sourceDesign
    })
    const sourceLocation = await saver(`source-${artboard.meta.id}.json`, stringify(artboard.raw))
    const octopusLocation = await saver(`octopus-${artboard.meta.id}.json`, stringify(octopus))
    console.log(`Artboard: ${ chalk.yellow(artboard.meta.name) } ${ chalk.grey(`(${artboard.meta.id})`) }
      Source: file://${ sourceLocation }
      Octopus: file://${ octopusLocation }
    `)
  })
})()