import fs from 'fs'
import path from 'path'

import handlebars from 'handlebars'

import { AssetsReader } from './services/assets-reader.js'
import { Tester } from './services/tester.js'
import { getCommandLineArgs } from './utils.js'

import type { Fail } from './services/tester.js'

function createReport(failed: Fail[]): string {
  const source = fs.readFileSync(path.join(__dirname, '/report/report-template.hbs')).toString()

  const template = handlebars.compile(source)

  const context = {
    failed,
  }
  const html = template(context)

  return html
}

async function test() {
  const { selectedTest } = getCommandLineArgs()
  const assetsReader = new AssetsReader({ selectedTest })
  const tester = new Tester(assetsReader)

  const failed = (await tester.test()) ?? []
  if (failed.length) {
    const html = createReport(failed)
    const reportPath = path.join(__dirname, 'report/test-report.html')

    /**@TODO maybe in future change template to jsondiff.com template */
    fs.writeFileSync(reportPath, html)

    console.error(`❌ FAILURE: ${failed.length} tests failed!\n`)
    console.error(`file:///${reportPath}\n`)
    process.exit(1)
  }

  console.info(`✅ SUCCESS: All tests passed!\n`)
  process.exit(0)
}

test()
