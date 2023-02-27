import * as url from 'url'

import { TestRunner } from '../common/services/test-runner.js'
import { SOURCE_FILE_NAME } from './const.js'
import { TestComparer } from './services/test-comparer.js'

const sourceFileName = SOURCE_FILE_NAME
const testComparer = new TestComparer()
const testDirPath = url.fileURLToPath(new URL('.', import.meta.url))

const tester = new TestRunner({ sourceFileName, testComparer, testDirPath })

tester.run()
