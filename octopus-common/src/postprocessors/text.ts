import { normalizeDefaults } from './text-normalize-defaults'
import { normalizeDupRanges } from './text-normalize-dup-ranges'
import { normalizeLinebreak } from './text-normalize-linebreak'

import type { Octopus } from '../typings/octopus-common'

export function normalizeText(text: Octopus['Text']): Octopus['Text'] {
  const processors = [normalizeLinebreak, normalizeDefaults, normalizeDupRanges]
  return processors.reduce((text, processor) => processor(text), text)
}
