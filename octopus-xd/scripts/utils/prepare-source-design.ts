import path from 'path'
import chalk from 'chalk'

import createSourceTree from './create-source-tree'
import SourceDesign from '../../src/entities/source/source-design'
import { createTempSaver } from './save-temp'
import { stringify } from './json-stringify'


type PrepareSourceDesignOptions = {
  id: string
}

export async function prepareSourceDesign(options: PrepareSourceDesignOptions) {
  const [ filename ] = process.argv.slice(2)
  const sourceTree = await createSourceTree(filename)
  const sourceDesign = SourceDesign.fromUnzippedBuffers(sourceTree)
  const saver = await createTempSaver(options)
  const manifestLocation = await saver('manifest.json', stringify(sourceDesign.manifest.raw))
  const interactionsLocation = await saver('interactions.json', stringify(sourceDesign.interactions.raw))
  const resourcesLocation = await saver('resources.json', stringify(sourceDesign.resources.raw))
  sourceDesign.images.forEach(async image => {
    await saver(path.basename(image.path), image.rawValue)
  })

  console.log(`${chalk.yellow('Manifest: ')}
    file://${ manifestLocation }`)
  console.log(`${chalk.yellow('Interactions: ')}
    file://${ interactionsLocation }`)
  console.log(`${chalk.yellow('Resources: ')}
    file://${ resourcesLocation }`)

  return sourceDesign
}
