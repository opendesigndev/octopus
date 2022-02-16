import { promises as fsp } from 'fs'
import {RawSource} from '../../src/typings/source'

const SOURCE_ADDRESS= './temp/input/source.json'

export async function getSourceJSON (){
   const fileContent = await fsp.readFile(SOURCE_ADDRESS,'utf-8')
   return JSON.parse(fileContent) as RawSource
}