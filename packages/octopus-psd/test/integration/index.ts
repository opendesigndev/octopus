import fs from 'fs'
import path from 'path'

import { timestamp } from '@opendesign/octopus-common/utils/timestamp'
import handlebars from 'handlebars'

import { saveFile, makeDir } from '../../src/utils/files'
import { AssetReader } from './services/asset-reader'
import { Tester } from './services/tester'
import { getCommandLineArgs } from './utils/argv'

import type { Fail } from './services/tester'

const REPORT_FOLDER = 'report'

function createReport(failed: Fail[]): string {
  const source = fs
    .readFileSync(path.join(__dirname, '../../../../test/integration/assets/report-template.hbs'))
    .toString()
  const template = handlebars.compile(source)
  return template({ failed })
}

async function test() {
  const { selectedTest } = getCommandLineArgs()
  const assetsReader = new AssetReader({ selectedTest })
  const tester = new Tester(assetsReader)

  const failed = (await tester.test()) ?? []
  if (failed.length) {
    const html = createReport(failed)
    await makeDir(path.join(__dirname, REPORT_FOLDER))

    const reportPath = path.join(__dirname, REPORT_FOLDER, `test-report-${timestamp()}.html`)

    await saveFile(reportPath, html)

    console.error(`❌ FAILURE: ${failed.length} tests failed!\n`)
    console.error(`file:///${reportPath}\n`)
    process.exit(1)
  }

  console.info(`✅ SUCCESS: All tests passed!\n`)
  process.exit(0)
}

test()
