import { promises as fsp } from 'fs'

import type { RawSource } from '../../src/typings/raw/index.js'

const SOURCE_ADDRESS = './temp/input/source.json'

export async function getSourceJSON(): Promise<RawSource> {
  const fileContent = await fsp.readFile(SOURCE_ADDRESS, 'utf-8')
  return JSON.parse(fileContent) as RawSource
}
