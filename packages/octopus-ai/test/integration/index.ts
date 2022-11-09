import fs from 'fs'
import path from 'path'

import handlebars from 'handlebars'

import { AssetsReader } from './services/assets-reader'
import { Tester } from './services/tester'
import { getCommandLineArgs } from './utils'

import type { Fail } from './services/tester'

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
  const success = !failed.length

  if (!success) {
    const html = createReport(failed)
    const pathToReport = path.join(__dirname, 'report/test-report.html')

    /**@TODO maybe in future change template to jsondiff.com template */
    fs.writeFileSync(pathToReport, html)
    console.error('Tests failed')

    console.error(`file:///${pathToReport}`)

    process.exit(1)
  }

  console.info('All tests passed')
  process.exit(0)
}

test()
