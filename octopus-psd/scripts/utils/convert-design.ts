import chalk from 'chalk'
import { performance } from 'perf_hooks'
import { v4 as uuidv4 } from 'uuid'
import { execSync } from 'child_process'
import path from 'path'
import dotenv from 'dotenv'

import { OctopusPSDConverter } from '../../src'
import { prepareSourceDesign } from './prepare-source-design'
import { createTempSaver } from './save-temp'
import { stringify } from './json-stringify'
import { SourceDesign } from '../../src/entities/source/source-design'

dotenv.config()

async function convert(converter: OctopusPSDConverter, sourceDesign: SourceDesign) {
  // TODO https://gitlab.avcd.cz/opendesign/octopus-converters/-/merge_requests/3#note_276626
  try {
    return await converter.convertDesign({ sourceDesign })
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

export async function convertDesign(): Promise<void> {
  const designId = uuidv4()
  const [filename] = process.argv.slice(2)
  console.info(`Start converting file: ${chalk.yellow(filename)}`)
  if (filename === undefined) return console.error('Missing argument (path to .psd file)')
  const converter = new OctopusPSDConverter({ designId })
  const sourceDesign = await prepareSourceDesign(converter, filename, designId)
  console.info(`Photoshop source file converted to directory: ${chalk.yellow(designId)}`)

  const timeStart = performance.now()
  const convertResult = await convert(converter, sourceDesign)
  const octopus = convertResult?.artboards[0]?.value
  const time = Math.round(performance.now() - timeStart)

  const saver = await createTempSaver(designId)
  const octopusLocation = await saver('octopus.json', stringify(octopus))
  const octopusDir = path.dirname(octopusLocation)
  const sourceLocation = `${octopusDir}/source.json`
  console.info(`${octopus ? '✅' : '❌'} ${chalk.yellow('octopus.json')} (${time}ms) ${chalk.grey(`(${octopus?.id})`)}`)
  console.info(`  Source: file://${sourceLocation}`)
  console.info(`  Octopus: file://${octopusLocation}`)
  const shouldRender = process.env.CONVERT_RENDER === 'true'
  const renderLocation = octopus && shouldRender ? await renderOctopus(octopusDir) : null
  shouldRender && console.info(`  Render: file://${renderLocation}`)
}
