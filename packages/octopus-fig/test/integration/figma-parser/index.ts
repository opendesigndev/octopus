import { SOURCE_FILE_NAME } from './const.js'
import { TestComparer } from './services/test-comparer.js'
import { TestRunner } from '../common/services/test-runner.js'

const sourceFileName = SOURCE_FILE_NAME
const testComparer = new TestComparer()
const testDirPath = new URL('.', import.meta.url).pathname

const tester = new TestRunner({ sourceFileName, testComparer, testDirPath })

tester.run()
