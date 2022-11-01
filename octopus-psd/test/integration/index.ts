import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { timestamp } from '@opendesign/octopus-common/dist/utils/timestamp.js'
import handlebars from 'handlebars'

import { saveFile, makeDir } from '../../src/utils/files.js'
import { AssetReader } from './services/asset-reader.js'
import { Tester } from './services/tester.js'
import { getCommandLineArgs } from './utils/argv.js'

import type { Fail } from './services/tester'

const REPORT_FOLDER = 'report'

function createReport(failed: Fail[]): string {
  const source = fs
    .readFileSync(
      path.join(fileURLToPath(new URL(import.meta.url)), '../../../../test/integration/assets/report-template.hbs')
    )
    .toString()
  const template = handlebars.compile(source)
  return template({ failed })
}

async function test() {
  const { selectedTest } = getCommandLineArgs()
  const assetsReader = new AssetReader({ selectedTest })
  const tester = new Tester(assetsReader)

  const failed = (await tester.test()) ?? []
  const success = !failed.length

  if (!success) {
    const html = createReport(failed)
    await makeDir(path.join(fileURLToPath(new URL(import.meta.url)), '../', REPORT_FOLDER))

    const reportPath = path.join(
      fileURLToPath(new URL('.', import.meta.url)),
      REPORT_FOLDER,
      `test-report-${timestamp()}.html`
    )

    await saveFile(reportPath, html)

    console.error('FAILURE: Some tests failed!\n')
    console.error(`file:///${reportPath}\n`)
    process.exit(1)
  }

  console.info('SUCCESS: All tests passed!\n')
  process.exit(0)
}

test()
