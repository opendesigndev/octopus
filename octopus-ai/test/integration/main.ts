import { execSync } from 'child_process'

import { getCommandLineArgs } from '../../src/utils/test-utils'
import { AssetsReader } from './assets-reader'
import { createReport } from './create-report'
import { Tester } from './tester'

async function test() {
  const { isUpdate, selectedTest } = getCommandLineArgs()
  const assetsReader = new AssetsReader({ isUpdate, selectedTest })
  const tester = new Tester({ assetsReader, isUpdate: Boolean(isUpdate) })

  const failed = (await tester.test()) ?? []
  const success = !failed.length

  if (!success) {
    createReport(failed)
    execSync(`open ${process.cwd()}/test/integration/report/test-report.html`)
  }

  if (success && !isUpdate) {
    console.info('All tests passed')
    return
  }

  if (isUpdate) {
    console.info('Tests updated')
  }

  if (!success) {
    console.error('Tests failed')
  }
}

test()
