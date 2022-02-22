import chalk from 'chalk'
import { v4 as uuidv4 } from 'uuid'
import { execSync } from 'child_process'
import path from 'path'
import dotenv from 'dotenv'

import { OctopusPSDConverter } from '../../src'
import { prepareSourceDesign } from './prepare-source-design'
import { createTempSaver } from './save-temp'
import { stringify } from './json-stringify'

dotenv.config()

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

  const convertResult = await converter.convertDesign({ sourceDesign })
  const saver = await createTempSaver(designId)

  const octopus = convertResult?.artboards[0]
  const octopusLocation = await saver('octopus.json', stringify(octopus?.value))
  const octopusDir = path.dirname(octopusLocation)

  const manifest = convertResult?.manifest
  const manifestLocation = await saver('manifest.json', stringify(manifest))

  const sourceLocation = `${octopusDir}/source.json`
  console.info(`${octopus?.value ? '✅' : '❌'} ${chalk.yellow('octopus.json')} (${octopus?.time}ms)`)
  console.info(`  Source: file://${sourceLocation}`)
  console.info(`  Manifest: file://${manifestLocation}`)
  console.info(`  Octopus: file://${octopusLocation}`)

  const shouldRender = process.env.CONVERT_RENDER === 'true'
  const renderLocation = octopus && shouldRender ? await renderOctopus(octopusDir) : null
  shouldRender && console.info(`  Render: file://${renderLocation}`)
}
