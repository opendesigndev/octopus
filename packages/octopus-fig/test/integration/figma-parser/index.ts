import { TestRunner } from '../shared/services/test-runner'
import { SOURCE_FILE_NAME } from './const'
import { TestComparer } from './services/test-comparer'

const sourceFileName = SOURCE_FILE_NAME
const testComparer = new TestComparer()
const testDirPath = __dirname

const tester = new TestRunner({ sourceFileName, testComparer, testDirPath })

tester.run()
