import chalk from 'chalk'
import { performance } from 'perf_hooks'
import { v4 as uuidv4 } from 'uuid'
import { execSync } from 'child_process'
import path from 'path'
import dotenv from 'dotenv'

import { OctopusPSDConverter } from '../../src'
import { createSourceTree } from './create-source-tree'
import { createTempSaver } from './save-temp'
import { stringify } from './json-stringify'
import { SourceArtboard } from '../../src/entities/source/source-artboard'

dotenv.config()
const shouldRender = process.env.CONVERT_RENDER === 'true'

async function convert(converter: OctopusPSDConverter, sourceArtboard: SourceArtboard) {
  try {
    return await converter.convertArtboard({ sourceArtboard })
  } catch (e) {
    return null
  }
}

async function renderOctopus(octopusDir: string) {
  const renderPath = path.join(octopusDir, 'render.png')
  const command = `${process.env.RENDERING_PATH} ${octopusDir} ${renderPath}`
  try {
    execSync(command)
  } catch (e) {
    console.info(chalk.red(`Rendering failed while processing command: "${command}"`))
  }
  return renderPath
}

export async function convertArtboard() {
  const octopusId = uuidv4()
  const [filename] = process.argv.slice(2)
  console.info(`Start converting file: ${chalk.yellow(filename)}`)
  if (filename === undefined) {
    return console.error('Missing argument (path to .psd file)')
  }
  const converter = new OctopusPSDConverter({ octopusId })
  const sourceArtboard = await createSourceTree(converter, filename, octopusId)
  console.info(`Photoshop source file converted to directory: ${chalk.yellow(octopusId)}`)

  const timeStart = performance.now()
  const octopus = await convert(converter, sourceArtboard)
  const time = Math.round(performance.now() - timeStart)

  const saver = await createTempSaver(octopusId)
  const octopusLocation = await saver('octopus.json', stringify(octopus))
  const octopusDir = path.dirname(octopusLocation)
  const sourceLocation = `${octopusDir}/source.json`
  console.info(`${octopus ? '✅' : '❌'} ${chalk.yellow('octopus.json')} (${time}ms) ${chalk.grey(`(${octopus?.id})`)}`)
  console.info(`  Source: file://${sourceLocation}`)
  console.info(`  Octopus: file://${octopusLocation}`)
  const renderLocation = octopus && shouldRender ? await renderOctopus(octopusDir) : null
  shouldRender && console.info(`  Render: file://${renderLocation}`)
}