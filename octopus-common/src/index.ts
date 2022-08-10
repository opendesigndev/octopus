import * as FirstCallMemo from './decorators/first-call-memo.js'
import * as TextPostprocessor from './postprocessors/text.js'
import * as As from './utils/as.js'
import * as Async from './utils/async.js'
import * as Color from './utils/color.js'
import * as Common from './utils/common.js'
import * as MathUtils from './utils/math.js'
import * as Queue from './utils/queue-node.js'
import * as UtilityTypes from './utils/utility-types.js'

export const decorators = {
  firstCallMemo: FirstCallMemo,
}

export const postprocessors = {
  text: TextPostprocessor,
}

export const utils = {
  as: As,
  async: Async,
  color: Color,
  common: Common,
  math: MathUtils,
  queue: Queue,
  utilityTypes: UtilityTypes,
}
