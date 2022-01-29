import chalk from 'chalk'
import { performance } from 'perf_hooks'
import { v4 as uuidv4 } from 'uuid'
import { prepareSourceDesign } from './prepare-source-design'

export async function convertAll (){
    const id = uuidv4()

    prepareSourceDesign()

}