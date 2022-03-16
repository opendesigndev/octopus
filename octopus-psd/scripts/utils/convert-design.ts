import chalk from 'chalk'
import { execSync } from 'child_process'
import path from 'path'
import dotenv from 'dotenv'
import { performance } from 'perf_hooks'

import { OctopusPSDConverter } from '../../src'
import { createTempSaver } from './save-temp'
import { stringify } from './json-stringify'
import { symlink } from 'fs/promises'
import { displayPerf } from '../../src/utils/console'
import { timestamp } from './timestamp'

dotenv.config()

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

export async function convertDesign(filePath: string): Promise<void> {
  const timeStart = performance.now()
  const designId = `${timestamp()}-${path.basename(filePath, '.psd')}`
  console.info(`Start converting file: ${chalk.yellow(filePath)}`)
  if (filePath === undefined) return console.error('Missing argument (path to .psd file)')

  const saver = await createTempSaver(designId)

  const converter = await OctopusPSDConverter.fromFile({ filePath, designId })
  if (converter === null) {
    console.error('OctopusPSDConverter Failed')
    return
  }
  const sourceDesign = converter.sourceDesign.values
  console.info('sourceDesign', sourceDesign)

  await saver('sourceDesign.json', stringify(sourceDesign))

  const convertResult = await converter.convertDesign()

  const octopus = convertResult?.artboards[0]
  const octopusLocation = await saver('octopus.json', stringify(octopus?.value))
  const octopusDir = path.dirname(octopusLocation)

  const manifest = convertResult?.manifest
  const manifestLocation = await saver('manifest.json', stringify(manifest))

  const sourceLocation = `${octopusDir}/source.json`
  const sourceDesignLocation = `${octopusDir}/sourceDesign.json`
  console.info(`${octopus?.value ? '✅' : '❌'} ${chalk.yellow('octopus.json')} ${displayPerf(octopus?.time)}`)
  console.info(`  Source: file://${sourceLocation}`)
  console.info(`  SourceDesign: file://${sourceDesignLocation}`)
  console.info(`  Manifest: file://${manifestLocation}`)
  console.info(`  Octopus: file://${octopusLocation}`)

  const shouldRender = process.env.CONVERT_RENDER === 'true'
  if (octopus && shouldRender) {
    const { renderLocation, renderTime } = await renderOctopus(octopusDir)
    console.info(`  Render: file://${renderLocation} ${displayPerf(renderTime)}`)
  }
  const time = performance.now() - timeStart
  console.info(`Processing time: ${displayPerf(time)} \n\n`)
}
