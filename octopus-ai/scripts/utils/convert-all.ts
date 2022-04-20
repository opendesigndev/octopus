import { performance } from 'perf_hooks'

import chalk from 'chalk'
import { v4 as uuidv4 } from 'uuid'

import OctopusAIConverter from '../../src'
import { stringify } from './json-stringify'
import { prepareSourceDesign } from './prepare-source-design'
import { createTempSaver } from './save-temp'

import type SourceArtboard from '../../src/entities/source/source-artboard'
import type SourceDesign from '../../src/entities/source/source-design'

async function convert(converter: OctopusAIConverter, artboard: SourceArtboard, sourceDesign: SourceDesign) {
  try {
    return await converter.convertArtboardById({
      targetArtboardId: artboard.id,
      sourceDesign,
    })
  } catch (e) {
    return null
  }
}

export async function convertAll(): Promise<string[]> {
  const id = uuidv4()
  const converter = new OctopusAIConverter()
  const sourceDesign = await prepareSourceDesign()
  const saver = await createTempSaver({ id })

  return Promise.all(
    sourceDesign.artboards.map(async (artboard) => {
      const timeStart = performance.now()
      const octopus = await convert(converter, artboard, sourceDesign)
      const time = performance.now() - timeStart
      const octopusLocation = await saver(`octopus-${artboard.id}.json`, stringify(octopus))

      console.log(
        `${octopus ? '✅' : '❌'} ${chalk.yellow(artboard.name)} (${Math.round(time)}ms) ${chalk.grey(
          `(${artboard.id})`
        )}`
      )
      return octopusLocation
    })
  )
}
