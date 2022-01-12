import chalk from 'chalk'
import { performance } from 'perf_hooks'
import { v4 as uuidv4 } from 'uuid'

import { OctopusPSDConverter } from '../src'
import { createSourceTree } from './utils/create-source-tree'
import { createTempSaver } from './utils/save-temp'
import { stringify } from './utils/json-stringify'
import { SourceArtboard } from '../src/entities/source/source-artboard'

async function convert(converter: OctopusPSDConverter, sourceArtboard: SourceArtboard) {
  try {
    return await converter.convertArtboard({ sourceArtboard })
  } catch (e) {
    return null
  }
}

async function convertArtboard() {
  const octopusId = uuidv4()
  const [filename] = process.argv.slice(2)
  console.info(`Start converting file: ${chalk.yellow(filename)}`)
  if (filename === undefined) {
    return console.error('Missing argument (path to .psd file)')
  }
  const sourceArtboard = await createSourceTree(filename, octopusId)
  console.info(`Photoshop source file converted to directory: ${chalk.yellow(octopusId)}`)

  const timeStart = performance.now()
  const converter = new OctopusPSDConverter({ octopusId })
  const octopus = await convert(converter, sourceArtboard)
  const time = Math.round(performance.now() - timeStart)

  const saver = await createTempSaver(octopusId)
  const octopusLocation = await saver('octopus.json', stringify(octopus))
  console.info(`${octopus ? '✅' : '❌'} ${chalk.yellow('octopus.json')} (${time}ms) ${chalk.grey(`(${octopus?.id})`)}`)
  console.info(`  Octopus: file://${octopusLocation}`)
}

convertArtboard()
