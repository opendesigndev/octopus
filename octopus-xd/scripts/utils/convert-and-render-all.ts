import chalk from 'chalk'
import { promises as fsp } from 'fs'
import path from 'path'
import { performance } from 'perf_hooks'
import { v4 as uuidv4 } from 'uuid'
import { execSync } from 'child_process'

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

async function renderOctopus(id: string, octopusPath: string) {
  const octopusDir = path.dirname(octopusPath)
  const renderPath = path.join(octopusDir, `render-${id}.png`)
  await fsp.rename(octopusPath, path.join(octopusDir, 'octopus.json'))
  try {
    execSync(`${ process.env.RENDERING_PATH } ${ octopusDir } ${ renderPath }`)
  } catch (e) {
    console.log(chalk.red(`Rendering failed while processing ${octopusPath}`))
  }
  await fsp.rename(path.join(octopusDir, 'octopus.json'), octopusPath)
  return renderPath
}

export async function convertAndRenderAll() {
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
    const renderLocation = octopus ? await renderOctopus(artboard.meta.id, octopusLocation) : null

    console.log(`${ octopus ? '✅' : '❌' } ${ chalk.yellow(artboard.meta.name) } (${ Math.round(time) }ms) ${ chalk.grey(`(${artboard.meta.id})`) }
      ${ chalk.cyan(`Source:`) } file://${ sourceLocation }
      ${ chalk.cyan(`Octopus:`) } file://${ octopusLocation }
      ${ chalk.cyan(`Render:`) } ${ `file://${ renderLocation }` || '<none>' }
    `)
    return octopusLocation
  }))
}
