import * as FirstCallMemo from './decorators/first-call-memo'
import * as TextPostprocessor from './postprocessors/text'
import * as As from './utils/as'
import * as Async from './utils/async'
import * as Color from './utils/color'
import * as Common from './utils/common'
import * as MathUtils from './utils/math'
import * as Queue from './utils/queue-node'
import * as Timestamp from './utils/timestamp'
import * as UtilityTypes from './utils/utility-types'

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
  timestamp: Timestamp,
  utilityTypes: UtilityTypes,
}
