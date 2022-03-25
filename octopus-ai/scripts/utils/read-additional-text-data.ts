// @todo redo this logic. Discuss with Nikita how should this work

import dotenv from 'dotenv'
import { readFileSync } from 'fs'

import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'
import { AdditionalTextData } from '../../src/typings/additional-text-data'
import chalk from 'chalk'

dotenv.config()

export function readAdditionalTextData(): Nullable<AdditionalTextData> {
  const additionalTextDataLocation = process.env.ADDITIONAL_TEXT_DATA_LOCATION

  if (!additionalTextDataLocation) {
    console.log(chalk.red('skipping private Data'))
    return null
  }
  const input = readFileSync(additionalTextDataLocation, 'utf-8')

  return JSON.parse(input)
}
