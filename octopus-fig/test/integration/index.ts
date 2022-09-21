import fs from 'fs'
import path from 'path'

import handlebars from 'handlebars'

import { makeDir, saveFile } from '../../src/utils/files'
import { AssetReader } from './services/asset-reader'
import { Tester } from './services/tester'
import { getCommandLineArgs, timestamp } from './utils'

import type { Fail } from './services/tester'

const REPORT_FOLDER = 'report'

function createReport(failed: Fail[]): string {
  const source = fs.readFileSync(path.join(__dirname, '/assets/report-template.hbs')).toString()
  const template = handlebars.compile(source)
  return template({ failed })
}

async function test() {
  const { selectedAsset } = getCommandLineArgs()

  const assetsReader = new AssetReader({ selectedAsset })
  const tester = new Tester(assetsReader)

  const failed = (await tester.test()) ?? []
  // const failed = [{ name: 'TODO', json: '{todo:todo1}', diff: '{todo:todo2}' }]
  // const failed = [] as Fail[]

  if (failed.length) {
    const html = createReport(failed)

    await makeDir(path.join(__dirname, REPORT_FOLDER))

    const reportPath = path.join(__dirname, REPORT_FOLDER, `test-report-${timestamp()}.html`)

    await saveFile(reportPath, html)
    console.error('FAILURE: Some tests failed!\n')
    console.error(`file:///${reportPath}\n`)
    process.exit(1)
  }

  console.info('SUCCESS: All tests passed!\n')
  process.exit(0)
}

test()
