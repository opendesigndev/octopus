import os from 'os'
import path from 'path'

import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

import { createConverter, LocalExporter, SourcePluginReader } from '../../src/index-node.js'
import { getFilesFromDir, isDirectory, parseJsonFromFile } from '../../src/utils/files.js'

import type { PluginSource } from '../../src/typings/plugin-source.js'

type ConvertDesignOptions = {
  sourcePath: string
  shouldRender?: boolean
}

dotenv.config()

const converter = createConverter()

export async function convertDesign({ sourcePath }: ConvertDesignOptions): Promise<void> {
  const pluginSource: PluginSource | null = await parseJsonFromFile(sourcePath)
  const context = pluginSource?.context
  const { id: documentId, name: documentName } = context?.document ?? {}
  if (!pluginSource || !documentId || !documentName) {
    console.error(`Design conversion failed`, { documentId, documentName, pluginSource, context })
    return
  }

  const testDir = path.join(os.tmpdir(), uuidv4())
  const exporter = new LocalExporter({ path: testDir })

  const reader = new SourcePluginReader(pluginSource)
  await converter.convertDesign({ designEmitter: reader.parse(), exporter })
  await exporter.completed()

  console.info()
  console.info(`Output: file://${testDir}`)
}

async function convertDir(dirPath: string) {
  try {
    const files = (await getFilesFromDir(dirPath)) ?? []
    for (const file of files) {
      if (!/\.json$/i.test(file.name)) continue
      await convertDesign({ sourcePath: path.join(dirPath, file.name) })
    }
  } catch (err) {
    console.info(`Reading directory '${dirPath}' was not successful`, err)
  }
}

async function convert(locations: string[]) {
  for (const location of locations) {
    if (await isDirectory(location)) {
      await convertDir(location)
    } else {
      await convertDesign({ sourcePath: location })
    }
  }
}

const locations = process.argv.slice(2)
convert(locations)
