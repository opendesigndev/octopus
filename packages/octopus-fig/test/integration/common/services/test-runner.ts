import fs from 'fs'
import path from 'path'

import { timestamp } from '@opendesign/octopus-common/dist/utils/timestamp.js'
import handlebars from 'handlebars'

import { AssetReader } from './asset-reader.js'
import { makeDir, saveFile } from '../../../../src/utils/files.js'
import { getCommandLineArgs } from '../utils/argv.js'

import type { BaseTestComparer } from './base-test-comparer.js'

export type Fail = { name: string; json: string; diff: string }

export type TestRunnerOptions = {
  testDirPath: string
  sourceFileName: string
  testComparer: BaseTestComparer
}

export class TestRunner {
  private _testDirPath: string
  private _sourceFileName: string
  private _testComparer: BaseTestComparer

  static REPORT_FOLDER = 'report'

  constructor({ sourceFileName, testDirPath, testComparer }: TestRunnerOptions) {
    this._testDirPath = testDirPath
    this._sourceFileName = sourceFileName
    this._testComparer = testComparer
  }

  _createReport(failed: Fail[]): string {
    const source = fs.readFileSync(path.join(__dirname, '../report-template.hbs')).toString()
    const template = handlebars.compile(source)
    return template({ failed })
  }

  async run() {
    const { selectedAsset } = getCommandLineArgs()

    const sourceFileName = this._sourceFileName
    const testDirPath = this._testDirPath

    const assetsReader = new AssetReader({ selectedAsset, testDirPath, sourceFileName })
    const testComponents = await assetsReader.getTestsComponents()

    const failed = (await this._testComparer.test(testComponents)) ?? []
    if (failed.length) {
      const html = this._createReport(failed)

      await makeDir(path.join(__dirname, TestRunner.REPORT_FOLDER))

      const reportPath = path.join(__dirname, TestRunner.REPORT_FOLDER, `test-report-${timestamp()}.html`)

      await saveFile(reportPath, html)
      console.error(`❌ FAILURE: ${failed.length} tests failed!\n`)
      console.error(`file:///${reportPath}\n`)
      process.exit(1)
    }

    console.info(`✅ SUCCESS: All ${testComponents.length} tests passed!\n`)
    process.exit(0)
  }
}
