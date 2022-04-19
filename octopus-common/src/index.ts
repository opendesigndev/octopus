// Utils
import * as FirstCallMemo from './decorators/first-call-memo'
import * as TextPostprocessor from './postprocessors/text'
import * as As from './utils/as'
import * as Async from './utils/async'
import * as Benchmark from './utils/benchmark'
import * as Common from './utils/common'
import * as MathUtils from './utils/math'
import * as Pkg from './utils/pkg'
import * as Queue from './utils/queue'
import * as Text from './utils/text'
import * as UtilityTypes from './utils/utility-types'
// Decorators
// Postprocessors

export const postprocessors = {
  text: TextPostprocessor,
}

export const decorators = {
  firstCallMemo: FirstCallMemo,
}

export const utils = {
  as: As,
  async: Async,
  benchmark: Benchmark,
  common: Common,
  math: MathUtils,
  pkg: Pkg,
  text: Text,
  utilityTypes: UtilityTypes,
  queue: Queue,
}
