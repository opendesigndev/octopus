import { normalizeDefaults } from './text-normalize-defaults.js'
import { normalizeDupRanges } from './text-normalize-dup-ranges.js'
import { normalizeLinebreak } from './text-normalize-linebreak.js'

import type { Octopus } from '../typings/octopus-common/index.js'

export function normalizeText(text: Octopus['Text']): Octopus['Text'] {
  const processors = [normalizeLinebreak, normalizeDefaults, normalizeDupRanges]
  return processors.reduce((text, processor) => processor(text), text)
}
