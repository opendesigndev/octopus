import chalk from 'chalk'
import { v4 as uuidv4 } from 'uuid'
import { execSync } from 'child_process'
import path from 'path'
import dotenv from 'dotenv'
import { performance } from 'perf_hooks'

import { OctopusPSDConverter } from '../../src'
import { prepareSourceDesign } from './prepare-source-design'
import { createTempSaver } from './save-temp'
import { stringify } from './json-stringify'
import { symlink } from 'fs/promises'

dotenv.config()

function displayPerf(time: number): string {
  const color = time > 50 ? chalk.red : chalk.yellow
  return '(' + color(`${time.toFixed(2)}ms`) + ')'
}

async function renderOctopus(octopusDir: string) {
  // symlink fonts
  const symlinkPath = path.join(octopusDir, 'fonts')
  const fontsPath = path.join(octopusDir, '..', '..', 'fonts')
  await symlink(fontsPath, symlinkPath)

  const renderLocation = path.join(octopusDir, 'render.png')
  const command = `${process.env.RENDERING_PATH} ${octopusDir} ${renderLocation}`
  const timeStart = performance.now()
  try {
    execSync(command)
  } catch (e) {
    console.info(chalk.red(`Rendering failed while processing command: "${command}"`))
  }
  const renderTime = performance.now() - timeStart
  return { renderLocation, renderTime }
}

export async function convertDesign(filename: string): Promise<void> {
  const timeStart = performance.now()
  const designId = uuidv4()
  console.info(`Start converting file: ${chalk.yellow(filename)}`)
  if (filename === undefined) return console.error('Missing argument (path to .psd file)')

  const parseTimeStart = performance.now()
  const sourceDesign = await prepareSourceDesign(filename, designId)
  const parseTime = performance.now() - parseTimeStart
  console.info(`Photoshop source file converted to directory: ${chalk.yellow(designId)} ${displayPerf(parseTime)}`)

  const converter = new OctopusPSDConverter({ designId, sourceDesign })
  const convertResult = await converter.convertDesign()
  const saver = await createTempSaver(designId)

  const octopus = convertResult?.artboards[0]
  const octopusLocation = await saver('octopus.json', stringify(octopus?.value))
  const octopusDir = path.dirname(octopusLocation)

  const manifest = convertResult?.manifest
  const manifestLocation = await saver('manifest.json', stringify(manifest))

  const sourceLocation = `${octopusDir}/source.json`
  console.info(`${octopus?.value ? '✅' : '❌'} ${chalk.yellow('octopus.json')} ${displayPerf(octopus?.time)}`)
  console.info(`  Source: file://${sourceLocation}`)
  console.info(`  Manifest: file://${manifestLocation}`)
  console.info(`  Octopus: file://${octopusLocation}`)

  const shouldRender = process.env.CONVERT_RENDER === 'true'
  if (octopus && shouldRender) {
    const { renderLocation, renderTime } = await renderOctopus(octopusDir)
    console.info(`  Render: file://${renderLocation} ${displayPerf(renderTime)}`)
  }
  const time = performance.now() - timeStart
  console.info('Processing time:', displayPerf(time))
}
