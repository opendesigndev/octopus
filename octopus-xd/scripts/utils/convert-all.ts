import chalk from 'chalk'
import { performance } from 'perf_hooks'
import { v4 as uuidv4 } from 'uuid'

import SourceDesign from '../../src/entities-source/source-design'
import OctopusXDConverter from '../../src'
import { createTempSaver } from './save-temp'
import { stringify } from './json-stringify'
import SourceArtboard from '../../src/entities-source/source-artboard'
import { prepareSourceDesign } from './prepare-source-design'


async function convert(converter: OctopusXDConverter, artboard: SourceArtboard, sourceDesign: SourceDesign) {
  try {
    return await converter.convertArtboardById({
      targetArtboardId: artboard.meta.id,
      sourceDesign
    })
  } catch(e) {
    return null
  }
}

export async function convertAll() {
  const id = uuidv4()
  const sourceDesign = await prepareSourceDesign({ id })
  const converter = new OctopusXDConverter()
  const saver = await createTempSaver({ id })

  return Promise.all(sourceDesign.artboards.map(async artboard => {
    const timeStart = performance.now()
    const octopus = await convert(converter, artboard, sourceDesign)
    const time = performance.now() - timeStart
    const sourceLocation = await saver(`source-${artboard.meta.id}.json`, stringify(artboard.raw))
    const octopusLocation = await saver(`octopus-${artboard.meta.id}.json`, stringify(octopus))
    console.log(`${ octopus ? '✅' : '❌' } ${ chalk.yellow(artboard.meta.name) } (${ Math.round(time) }ms) ${ chalk.grey(`(${artboard.meta.id})`) }
      ${ chalk.cyan(`Source:`) } file://${ sourceLocation }
      ${ chalk.cyan(`Octopus:`) } file://${ octopusLocation }
    `)
    return octopusLocation
  }))
}
