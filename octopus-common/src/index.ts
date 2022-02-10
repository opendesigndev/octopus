// Utils
import * as As from './utils/as'
import * as Common from './utils/common'
import * as Pkg from './utils/pkg'
import * as UtilityTypes from './utils/utility-types'

// Decorators
import * as FirstCallMemo from './decorators/first-call-memo'

export const decorators = {
  firstCallMemo: FirstCallMemo,
}

export const utils = {
  as: As,
  common: Common,
  pkg: Pkg,
  utilityTypes: UtilityTypes,
}
