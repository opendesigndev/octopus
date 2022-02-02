import { execSync } from 'child_process'
import { promises as fsp } from 'fs'
import path from 'path'
import chalk from 'chalk'
import { v4 as uuidv4 } from 'uuid'

import OctopusXDConverter from '../../src'
import { createTempSaver } from './save-temp'
import { stringify } from './json-stringify'
import { prepareSourceDesign } from './prepare-source-design'
import { getPkgLocation } from './pkg-location'


type ConvertAllOptions = {
  render?: boolean
}

async function renderOctopus(
  id: string, octopusPath: string
): Promise<{ value: string | undefined, error: null | Error }> {
  const octopusDir = path.dirname(octopusPath)
  const renderPath = path.join(octopusDir, `render-${id}.png`)
  await fsp.rename(octopusPath, path.join(octopusDir, 'octopus.json'))
  const fontsDir = path.join(await getPkgLocation(), 'fonts')
  const fontsOption = fontsDir ? `--fonts ${ fontsDir }` : ''
  try {
    execSync(
      `${ process.env.RENDERING_PATH } ${ fontsOption } ${ octopusDir } ${ renderPath }`,
      { stdio: 'ignore' }
    )
    await fsp.rename(path.join(octopusDir, 'octopus.json'), octopusPath)
    return {
      value: renderPath,
      error: null
    }
  } catch (e) {
    // console.log(chalk.red(`Rendering failed while processing ${octopusPath}`))
    await fsp.rename(path.join(octopusDir, 'octopus.json'), octopusPath)
    return {
      value: undefined,
      error: e
    }
  }
}

export async function convertAll(options: ConvertAllOptions) {
  const id = uuidv4()
  const sourceDesign = await prepareSourceDesign({ id })
  const converter = new OctopusXDConverter()
  const saver = await createTempSaver({ id })
  const convertedDesign = await converter.convertDesign({ sourceDesign })

  const convertedManifest = await saver(
    `octopus-manifest.json`,
    stringify(convertedDesign.manifest)
  )

  console.log(`${chalk.yellow('Octopus-manifest: ')}
    file://${ convertedManifest }`)

  console.log(`${chalk.yellow('Artboards: ')}`)
  
  return convertedDesign.artboards.reduce(async (queue, conversion) => {
    const locations = await queue
    const artboard = sourceDesign.getArtboardById(conversion.targetArtboardId)
    const sourceLocation = await saver(
      `source-${conversion.targetArtboardId}.json`,
      stringify(artboard?.raw)
    )
    const octopusLocation = await saver(
      `octopus-${conversion.targetArtboardId}.json`,
      stringify(conversion.value)
    )

    const status = conversion.error ? '❌' : '✅'
    const name = chalk.yellow(artboard?.meta.name)
    const time = Math.round(conversion.time)
    const id = chalk.grey(`(${conversion.targetArtboardId})`)

    const render = options.render && !conversion.error
      ? await renderOctopus(conversion.targetArtboardId, octopusLocation)
      : null

    console.log(`    ${ status } ${ name } (${ time }ms) ${ id }
    ${ chalk.cyan(`Source:`) } file://${ sourceLocation }
    ${ chalk.cyan(`Octopus:`) } file://${ octopusLocation }
    ${ chalk.cyan(`Render:`) } ${ render === null ? '<none>' : (render.error ? chalk.red(render.error.message) : `file://${ render.value }`) }
    `)

    return [ ...locations, octopusLocation ]
  }, Promise.resolve([]))
}
