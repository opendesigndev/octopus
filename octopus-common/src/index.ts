import * as FirstCallMemo from './decorators/first-call-memo'
import * as TextPostprocessor from './postprocessors/text'
import * as As from './utils/as'
import * as Async from './utils/async'
import * as Common from './utils/common'
import * as MathUtils from './utils/math'
import * as Pkg from './utils/pkg'
import * as UtilityTypes from './utils/utility-types'

export const postprocessors = {
  text: TextPostprocessor,
}

export const decorators = {
  firstCallMemo: FirstCallMemo,
}

export const utils = {
  as: As,
  async: Async,
  common: Common,
  math: MathUtils,
  pkg: Pkg,
  text: Text,
  utilityTypes: UtilityTypes,
}
