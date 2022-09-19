import fs from 'fs'
import path from 'path'

import { createReport } from './create-report'
import { AssetsReader } from './services/assets-reader'
import { Tester } from './services/tester'
import { getCommandLineArgs } from './utils'

async function test() {
  const { selectedTest } = getCommandLineArgs()
  const assetsReader = new AssetsReader({ selectedTest })
  const tester = new Tester(assetsReader)

  const failed = (await tester.test()) ?? []
  const success = !failed.length

  if (!success) {
    const html = createReport(failed)
    /**@TODO maybe in future change template to jsondiff.com template */
    fs.writeFileSync(path.join(process.cwd(), '/test/integration/report/test-report.html'), html)
    console.error('Tests failed')

    console.error(`file:///${path.join(process.cwd(), 'test/integration/report/test-report.html')}`)

    process.exit(1)
  }

  console.info('All tests passed')
  process.exit(0)
}

test()
